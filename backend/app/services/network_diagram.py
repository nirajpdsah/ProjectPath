"""Network Diagram Generator for Project Analysis"""
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import networkx as nx
from io import BytesIO
from typing import Dict, List, Any, Tuple
import numpy as np


class NetworkDiagramGenerator:
    """Generate network diagrams for PERT/CPM analysis"""
    
    def __init__(self, activities: List[Dict], critical_path: List[str]):
        self.activities = {a['activityId']: a for a in activities}
        self.critical_path = set(critical_path)
        self.graph = nx.DiGraph()
        self._build_graph()
    
    def _build_graph(self):
        """Build NetworkX graph from activities"""
        # Identify start and end nodes
        has_predecessors = set()
        has_successors = set()
        
        # First pass: identify relationships
        for activity_id, activity in self.activities.items():
            predecessors = activity.get('predecessors', '')
            if predecessors and predecessors != 'None':
                has_predecessors.add(activity_id)
                preds = [p.strip() for p in predecessors.split(',')]
                for pred in preds:
                    if pred:
                        has_successors.add(pred)
        
        # Find start nodes (no predecessors) and end nodes (no successors)
        start_nodes = [aid for aid in self.activities.keys() if aid not in has_predecessors]
        end_nodes = [aid for aid in self.activities.keys() if aid not in has_successors]
        
        # Add START node if there are multiple start activities or for clarity
        if len(start_nodes) > 0:
            self.graph.add_node('START', activityId='START', duration=0, ES=0, EF=0, LS=0, LF=0, isStartOrEnd=True)
            self.activities['START'] = {'activityId': 'START', 'duration': 0, 'ES': 0, 'EF': 0, 'LS': 0, 'LF': 0, 'isStartOrEnd': True}
        
        # Add END node if there are multiple end activities or for clarity
        if len(end_nodes) > 0:
            # Calculate END node timing from the last activities
            max_ef = max((self.activities[aid].get('EF', 0) or 0) for aid in end_nodes)
            self.graph.add_node('END', activityId='END', duration=0, ES=max_ef, EF=max_ef, LS=max_ef, LF=max_ef, isStartOrEnd=True)
            self.activities['END'] = {'activityId': 'END', 'duration': 0, 'ES': max_ef, 'EF': max_ef, 'LS': max_ef, 'LF': max_ef, 'isStartOrEnd': True}
        
        # Add all activities as nodes
        for activity_id, activity in self.activities.items():
            if activity_id not in ['START', 'END']:
                self.graph.add_node(activity_id, **activity)
        
        # Add edges from START to start activities
        for start_node in start_nodes:
            self.graph.add_edge('START', start_node)
        
        # Add edges based on predecessors
        for activity_id, activity in self.activities.items():
            if activity_id in ['START', 'END']:
                continue
            predecessors = activity.get('predecessors', '')
            if predecessors and predecessors != 'None':
                preds = [p.strip() for p in predecessors.split(',')]
                for pred in preds:
                    if pred and pred in self.activities:
                        self.graph.add_edge(pred, activity_id)
        
        # Add edges from end activities to END
        for end_node in end_nodes:
            self.graph.add_edge(end_node, 'END')
    
    def _hierarchical_layout(self) -> Dict[str, Tuple[float, float]]:
        """Create hierarchical layout based on activity levels"""
        # Calculate levels using topological sort
        levels = {}
        visited = set()
        
        def calculate_level(node):
            if node in visited:
                return levels.get(node, 0)
            
            visited.add(node)
            predecessors = list(self.graph.predecessors(node))
            
            if not predecessors:
                levels[node] = 0
            else:
                max_pred_level = max(calculate_level(pred) for pred in predecessors)
                levels[node] = max_pred_level + 1
            
            return levels[node]
        
        # Calculate levels for all nodes
        for node in self.graph.nodes():
            calculate_level(node)
        
        # Group nodes by level
        level_nodes = {}
        for node, level in levels.items():
            if level not in level_nodes:
                level_nodes[level] = []
            level_nodes[level].append(node)
        
        # Create positions
        pos = {}
        max_level = max(levels.values()) if levels else 0
        
        for level, nodes in level_nodes.items():
            # Sort nodes at same level for consistent ordering
            nodes = sorted(nodes)
            num_nodes = len(nodes)
            
            for i, node in enumerate(nodes):
                x = level * 2.5  # Horizontal spacing
                # Center nodes vertically at each level
                y = (i - (num_nodes - 1) / 2) * 1.5
                pos[node] = (x, y)
        
        return pos
    
    def generate_diagram(self, width: float = 10, height: float = 6) -> BytesIO:
        """Generate network diagram and return as BytesIO"""
        # Create figure
        fig, ax = plt.subplots(figsize=(width, height), facecolor='white')
        
        # Get layout
        pos = self._hierarchical_layout()
        
        if not pos:
            # Fallback to spring layout if hierarchical fails
            pos = nx.spring_layout(self.graph, k=2, iterations=50)
        
        # Separate critical and non-critical edges
        critical_edges = []
        normal_edges = []
        
        for edge in self.graph.edges():
            if edge[0] in self.critical_path and edge[1] in self.critical_path:
                critical_edges.append(edge)
            else:
                normal_edges.append(edge)
        
        # Draw normal edges
        nx.draw_networkx_edges(
            self.graph, pos,
            edgelist=normal_edges,
            edge_color='#9CA3AF',
            width=1.5,
            alpha=0.6,
            arrows=True,
            arrowsize=15,
            arrowstyle='->',
            connectionstyle='arc3,rad=0.1',
            ax=ax
        )
        
        # Draw critical path edges
        nx.draw_networkx_edges(
            self.graph, pos,
            edgelist=critical_edges,
            edge_color='#DC2626',
            width=3,
            alpha=0.9,
            arrows=True,
            arrowsize=20,
            arrowstyle='-|>',
            connectionstyle='arc3,rad=0.1',
            ax=ax
        )
        
        # Separate critical, non-critical, and start/end nodes
        start_end_nodes = [n for n in self.graph.nodes() if n in ['START', 'END']]
        critical_nodes = [n for n in self.graph.nodes() if n in self.critical_path and n not in start_end_nodes]
        normal_nodes = [n for n in self.graph.nodes() if n not in self.critical_path and n not in start_end_nodes]
        
        # Draw normal nodes
        nx.draw_networkx_nodes(
            self.graph, pos,
            nodelist=normal_nodes,
            node_color='#3B82F6',
            node_size=800,
            alpha=0.9,
            ax=ax
        )
        
        # Draw critical nodes
        nx.draw_networkx_nodes(
            self.graph, pos,
            nodelist=critical_nodes,
            node_color='#DC2626',
            node_size=1000,
            alpha=0.95,
            ax=ax
        )
        
        # Draw START/END nodes differently
        if start_end_nodes:
            nx.draw_networkx_nodes(
                self.graph, pos,
                nodelist=start_end_nodes,
                node_color='#059669',
                node_size=900,
                alpha=0.95,
                node_shape='s',  # Square shape for start/end
                ax=ax
            )
        
        # Add node labels
        labels = {node: node for node in self.graph.nodes()}
        nx.draw_networkx_labels(
            self.graph, pos,
            labels,
            font_size=11,
            font_weight='bold',
            font_color='white',
            ax=ax
        )
        
        # Add title
        ax.set_title('Project Network Diagram', 
                     fontsize=16, 
                     fontweight='bold',
                     color='#1F2937',
                     pad=20)
        
        # Add legend
        from matplotlib.patches import Patch
        legend_elements = [
            Patch(facecolor='#059669', label='Start/End Nodes'),
            Patch(facecolor='#DC2626', label='Critical Path'),
            Patch(facecolor='#3B82F6', label='Non-Critical Activities')
        ]
        ax.legend(handles=legend_elements, 
                 loc='upper left',
                 frameon=True,
                 fancybox=True,
                 shadow=True,
                 fontsize=10)
        
        # Remove axes
        ax.axis('off')
        
        # Adjust layout to prevent label cutoff
        plt.tight_layout(pad=1.5)
        
        # Save to BytesIO
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        buf.seek(0)
        
        # Close the plot to free memory
        plt.close(fig)
        
        return buf
    
    def generate_aon_diagram(self, width: float = 12, height: float = 8) -> BytesIO:
        """Generate Activity-on-Node (AON) diagram with detailed boxes"""
        fig, ax = plt.subplots(figsize=(width, height), facecolor='white')
        
        # Get layout
        pos = self._hierarchical_layout()
        
        if not pos:
            pos = nx.spring_layout(self.graph, k=2.5, iterations=50)
        
        # Draw edges first (so they appear behind nodes)
        for edge in self.graph.edges():
            start_pos = pos[edge[0]]
            end_pos = pos[edge[1]]
            
            # Determine if edge is critical
            is_critical = edge[0] in self.critical_path and edge[1] in self.critical_path
            
            # Draw arrow
            ax.annotate('',
                       xy=end_pos, xytext=start_pos,
                       arrowprops=dict(
                           arrowstyle='-|>',
                           color='#DC2626' if is_critical else '#6B7280',
                           lw=2.5 if is_critical else 1.5,
                           alpha=0.8,
                           connectionstyle='arc3,rad=0.1'
                       ))
        
        # Draw nodes as detailed boxes
        for node, (x, y) in pos.items():
            activity = self.activities.get(node, {})
            is_critical = node in self.critical_path
            is_start_end = node in ['START', 'END']
            
            # Box dimensions
            if is_start_end:
                box_width = 1.2
                box_height = 0.8
            else:
                box_width = 2.0
                box_height = 1.4
            
            # Colors
            if is_start_end:
                box_color = '#D1FAE5'
                border_color = '#059669'
                text_color = '#065F46'
            elif is_critical:
                box_color = '#FEE2E2'
                border_color = '#DC2626'
                text_color = '#7F1D1D'
            else:
                box_color = '#DBEAFE'
                border_color = '#3B82F6'
                text_color = '#1E40AF'
            
            # Draw box
            rect = plt.Rectangle(
                (x - box_width/2, y - box_height/2),
                box_width, box_height,
                facecolor=box_color,
                edgecolor=border_color,
                linewidth=2.5 if is_critical else 2,
                zorder=2
            )
            ax.add_patch(rect)
            
            # Add activity ID (center, bold)
            if is_start_end:
                # Just show START/END label
                ax.text(x, y, node,
                       ha='center', va='center',
                       fontsize=14, fontweight='bold',
                       color=text_color,
                       zorder=3)
            else:
                # Activity name at top center
                ax.text(x, y + 0.35, node,
                       ha='center', va='center',
                       fontsize=12, fontweight='bold',
                       color=text_color,
                       zorder=3)
                
                # Duration in center
                duration = activity.get('duration', 0)
                duration_text = f"Duration: {duration:.0f}" if duration is not None else "Duration: -"
                ax.text(x, y, duration_text,
                       ha='center', va='center',
                       fontsize=9,
                       color=text_color,
                       zorder=3)
                
                # ES in top-left corner
                es = activity.get('ES', 0)
                es_text = f"{es:.0f}" if es is not None else "-"
                ax.text(x - box_width/2 + 0.15, y + box_height/2 - 0.15,
                       es_text,
                       ha='center', va='center',
                       fontsize=9,
                       color=text_color,
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7, edgecolor='none'),
                       zorder=3)
                
                # EF in top-right corner
                ef = activity.get('EF', 0)
                ef_text = f"{ef:.0f}" if ef is not None else "-"
                ax.text(x + box_width/2 - 0.15, y + box_height/2 - 0.15,
                       ef_text,
                       ha='center', va='center',
                       fontsize=9,
                       color=text_color,
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7, edgecolor='none'),
                       zorder=3)
                
                # LS in bottom-left corner
                ls = activity.get('LS', 0)
                ls_text = f"{ls:.0f}" if ls is not None else "-"
                ax.text(x - box_width/2 + 0.15, y - box_height/2 + 0.15,
                       ls_text,
                       ha='center', va='center',
                       fontsize=9,
                       color=text_color,
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7, edgecolor='none'),
                       zorder=3)
                
                # LF in bottom-right corner
                lf = activity.get('LF', 0)
                lf_text = f"{lf:.0f}" if lf is not None else "-"
                ax.text(x + box_width/2 - 0.15, y - box_height/2 + 0.15,
                       lf_text,
                       ha='center', va='center',
                       fontsize=9,
                       color=text_color,
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.7, edgecolor='none'),
                       zorder=3)
                
                # Add labels for corners (smaller text above values)
                label_fontsize = 6
                label_offset = 0.08
                ax.text(x - box_width/2 + 0.15, y + box_height/2 - 0.15 + label_offset,
                       'ES',
                       ha='center', va='bottom',
                       fontsize=label_fontsize,
                       color=text_color,
                       zorder=3)
                ax.text(x + box_width/2 - 0.15, y + box_height/2 - 0.15 + label_offset,
                       'EF',
                       ha='center', va='bottom',
                       fontsize=label_fontsize,
                       color=text_color,
                       zorder=3)
                ax.text(x - box_width/2 + 0.15, y - box_height/2 + 0.15 - label_offset,
                       'LS',
                       ha='center', va='top',
                       fontsize=label_fontsize,
                       color=text_color,
                       zorder=3)
                ax.text(x + box_width/2 - 0.15, y - box_height/2 + 0.15 - label_offset,
                       'LF',
                       ha='center', va='top',
                       fontsize=label_fontsize,
                       color=text_color,
                       zorder=3)
        
        # Add title
        ax.set_title('Activity-on-Node (AON) Network Diagram',
                     fontsize=16,
                     fontweight='bold',
                     color='#1F2937',
                     pad=20)
        
        # Add legend
        from matplotlib.patches import Patch
        legend_elements = [
            Patch(facecolor='#D1FAE5', edgecolor='#059669',
                  label='Start/End Nodes', linewidth=2),
            Patch(facecolor='#FEE2E2', edgecolor='#DC2626', 
                  label='Critical Activities', linewidth=2),
            Patch(facecolor='#DBEAFE', edgecolor='#3B82F6',
                  label='Non-Critical Activities', linewidth=2)
        ]
        ax.legend(handles=legend_elements,
                 loc='upper left',
                 frameon=True,
                 fancybox=True,
                 shadow=True,
                 fontsize=10)
        
        # Set axis limits with padding
        if pos:
            x_vals = [p[0] for p in pos.values()]
            y_vals = [p[1] for p in pos.values()]
            x_margin = (max(x_vals) - min(x_vals)) * 0.15
            y_margin = (max(y_vals) - min(y_vals)) * 0.15
            ax.set_xlim(min(x_vals) - 1 - x_margin, max(x_vals) + 1 + x_margin)
            ax.set_ylim(min(y_vals) - 1 - y_margin, max(y_vals) + 1 + y_margin)
        
        # Remove axes
        ax.axis('off')
        ax.set_aspect('equal')
        
        # Adjust layout
        plt.tight_layout(pad=1.5)
        
        # Save to BytesIO
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buf.seek(0)
        
        plt.close(fig)
        
        return buf


def generate_network_diagram(activities: List[Dict], critical_path: List[str], 
                            diagram_type: str = 'aon') -> BytesIO:
    """
    Generate network diagram
    
    Args:
        activities: List of activity dictionaries with ES, EF, LS, LF values
        critical_path: List of activity IDs in critical path
        diagram_type: 'simple' or 'aon' (Activity-on-Node with details)
    
    Returns:
        BytesIO buffer containing PNG image
    """
    generator = NetworkDiagramGenerator(activities, critical_path)
    
    if diagram_type == 'aon':
        return generator.generate_aon_diagram()
    else:
        return generator.generate_diagram()
