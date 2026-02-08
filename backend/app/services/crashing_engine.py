from typing import List, Dict, Tuple
from collections import defaultdict, deque
import copy

class CrashingEngine:
    """Complete Project Crashing with iterative optimization"""
    
    def __init__(self, activities_data: List[Dict]):
        """
        Initialize with crashing activity data
        Each activity: activityId, duration, crashTime, cost, crashCost, predecessors
        """
        self.original_activities = {a['activityId']: copy.deepcopy(a) for a in activities_data}
        self.activities = copy.deepcopy(self.original_activities)
        
    def build_graph(self):
        """Build the project network DAG"""
        graph = defaultdict(list)
        reverse_graph = defaultdict(list)
        
        for activity_id in self.activities:
            if activity_id not in graph:
                graph[activity_id] = []
            if activity_id not in reverse_graph:
                reverse_graph[activity_id] = []
        
        for activity_id, activity in self.activities.items():
            predecessors = activity.get('predecessors', '')
            if predecessors:
                if not isinstance(predecessors, str):
                    predecessors = str(predecessors).strip()
                    
                preds = [p.strip() for p in predecessors.split(',') if p.strip()]
                for pred in preds:
                    if pred not in self.activities:
                        raise ValueError(f"Activity '{activity_id}' references undefined predecessor '{pred}'")
                    graph[pred].append(activity_id)
                    reverse_graph[activity_id].append(pred)
        
        return graph, reverse_graph
    
    def validate_dag(self, graph):
        """Validate that the graph is a DAG (no cycles)"""
        visited = set()
        rec_stack = set()
        
        def has_cycle(node):
            visited.add(node)
            rec_stack.add(node)
            
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    if has_cycle(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            
            rec_stack.remove(node)
            return False
        
        for node in self.activities:
            if node not in visited:
                if has_cycle(node):
                    return False
        return True
    
    def get_duration(self, activity_id: str) -> float:
        """Get current duration for an activity"""
        return float(self.activities[activity_id].get('duration', 0))
    
    def forward_pass(self, graph, reverse_graph) -> Dict[str, Dict]:
        """Calculate ES and EF for all activities"""
        es_ef = {}
        in_degree = {node: len(reverse_graph[node]) for node in self.activities}
        queue = deque([node for node in self.activities if in_degree[node] == 0])
        
        while queue:
            current = queue.popleft()
            
            if not reverse_graph[current]:
                es_ef[current] = {'ES': 0}
            else:
                es_ef[current] = {'ES': max(es_ef[pred]['EF'] for pred in reverse_graph[current])}
            
            duration = self.get_duration(current)
            es_ef[current]['EF'] = es_ef[current]['ES'] + duration
            
            for successor in graph[current]:
                in_degree[successor] -= 1
                if in_degree[successor] == 0:
                    queue.append(successor)
        
        return es_ef
    
    def backward_pass(self, graph, reverse_graph, project_duration: float) -> Dict[str, Dict]:
        """Calculate LS and LF for all activities"""
        ls_lf = {}
        out_degree = {node: len(graph[node]) for node in self.activities}
        queue = deque([node for node in self.activities if out_degree[node] == 0])
        
        while queue:
            current = queue.popleft()
            
            if not graph[current]:
                ls_lf[current] = {'LF': project_duration}
            else:
                ls_lf[current] = {'LF': min(ls_lf[succ]['LS'] for succ in graph[current])}
            
            duration = self.get_duration(current)
            ls_lf[current]['LS'] = ls_lf[current]['LF'] - duration
            
            for predecessor in reverse_graph[current]:
                out_degree[predecessor] -= 1
                if out_degree[predecessor] == 0:
                    queue.append(predecessor)
        
        return ls_lf
    
    def find_critical_path(self, graph, reverse_graph, critical_activities: List[str]) -> List[str]:
        """Find the actual critical path"""
        path = []
        current = None
        
        for activity_id in critical_activities:
            preds = reverse_graph.get(activity_id, [])
            critical_preds = [p for p in preds if p in critical_activities]
            if not critical_preds:
                current = activity_id
                break
        
        if not current:
            return critical_activities[:1] if critical_activities else []
        
        path = [current]
        visited = {current}
        
        while current:
            next_node = None
            for successor in graph.get(current, []):
                if successor in critical_activities and successor not in visited:
                    next_node = successor
                    break
            
            if next_node:
                path.append(next_node)
                visited.add(next_node)
                current = next_node
            else:
                break
        
        return path
    
    def analyze_current_state(self) -> Dict:
        """Perform CPM analysis on current state"""
        graph, reverse_graph = self.build_graph()
        
        if not self.validate_dag(graph):
            raise ValueError("Graph contains cycles")
        
        es_ef = self.forward_pass(graph, reverse_graph)
        project_duration = max(ef['EF'] for ef in es_ef.values()) if es_ef else 0
        ls_lf = self.backward_pass(graph, reverse_graph, project_duration)
        
        critical_activities = []
        for activity_id in self.activities:
            slack = ls_lf[activity_id]['LS'] - es_ef[activity_id]['ES']
            is_critical = abs(slack) < 0.01
            
            if is_critical:
                critical_activities.append(activity_id)
            
            self.activities[activity_id].update({
                'ES': es_ef[activity_id]['ES'],
                'EF': es_ef[activity_id]['EF'],
                'LS': ls_lf[activity_id]['LS'],
                'LF': ls_lf[activity_id]['LF'],
                'slack': slack,
                'isCritical': is_critical
            })
        
        critical_path = self.find_critical_path(graph, reverse_graph, critical_activities)
        
        return {
            'projectDuration': project_duration,
            'criticalPath': critical_path,
            'activities': list(copy.deepcopy(self.activities).values())
        }
    
    def get_crash_slope(self, activity_id: str) -> float:
        """Calculate crash slope (cost per unit time)"""
        original = self.original_activities[activity_id]
        current = self.activities[activity_id]
        
        normal_time = float(original.get('duration', 0))
        crash_time = float(original.get('crashTime', normal_time))
        normal_cost = float(original.get('cost', 0))
        crash_cost = float(original.get('crashCost', normal_cost))
        
        if normal_time == crash_time:
            return float('inf')
        
        return (crash_cost - normal_cost) / (normal_time - crash_time)
    
    def can_crash(self, activity_id: str) -> bool:
        """Check if activity can still be crashed"""
        original = self.original_activities[activity_id]
        current = self.activities[activity_id]
        
        current_duration = float(current.get('duration', 0))
        crash_time = float(original.get('crashTime', current_duration))
        
        return current_duration > crash_time
    
    def crash_activity(self, activity_id: str, amount: float = 1.0):
        """Crash an activity by specified amount"""
        original = self.original_activities[activity_id]
        current = self.activities[activity_id]
        
        current_duration = float(current.get('duration', 0))
        crash_time = float(original.get('crashTime', current_duration))
        
        max_crash = current_duration - crash_time
        actual_crash = min(amount, max_crash)
        
        new_duration = current_duration - actual_crash
        self.activities[activity_id]['duration'] = new_duration
        
        return actual_crash
    
    def calculate_crashing_scheme(self, target_duration: float = None) -> Dict:
        """
        Calculate optimal crashing scheme with step-by-step reduction
        Returns complete analysis with crashing schedule
        """
        # Reset activities to original state for fresh analysis
        self.activities = copy.deepcopy(self.original_activities)
        
        # Initial analysis
        initial_analysis = self.analyze_current_state()
        initial_duration = initial_analysis['projectDuration']
        
        if target_duration is None:
            target_duration = initial_duration * 0.7  # Reduce by 30% as default
        
        crashing_steps = []
        current_duration = initial_duration
        total_cost_increase = 0
        step_number = 0
        
        # Store all activities info for final output
        all_activities_states = []
        
        while current_duration > target_duration:
            step_number += 1
            
            # Analyze current state
            analysis = self.analyze_current_state()
            current_duration = analysis['projectDuration']
            critical_path = analysis['criticalPath']
            
            if current_duration <= target_duration:
                break
            
            # Find crashable activities on critical path
            crashable = []
            for act_id in critical_path:
                if self.can_crash(act_id):
                    slope = self.get_crash_slope(act_id)
                    original = self.original_activities[act_id]
                    current = self.activities[act_id]
                    
                    max_crash_remaining = float(current.get('duration', 0)) - float(original.get('crashTime', 0))
                    
                    crashable.append({
                        'activityId': act_id,
                        'crashSlope': slope,
                        'maxCrashRemaining': max_crash_remaining
                    })
            
            if not crashable:
                break  # No more activities can be crashed
            
            # Sort by crash slope (cheapest first)
            crashable.sort(key=lambda x: x['crashSlope'])
            
            # Crash the cheapest activity
            best_activity = crashable[0]
            activity_id = best_activity['activityId']
            
            # Calculate amount to crash: use remaining time to target (allowing fractional crashes)
            crash_amount = min(best_activity['maxCrashRemaining'], current_duration - target_duration)
            actual_crashed = self.crash_activity(activity_id, crash_amount)
            
            # Calculate cost increase
            slope = self.get_crash_slope(activity_id)
            cost_increase = slope * actual_crashed
            total_cost_increase += cost_increase
            
            # Record this step
            new_duration = current_duration - actual_crashed
            
            crashing_steps.append({
                'step': step_number,
                'activityCrashed': activity_id,
                'amountCrashed': actual_crashed,
                'crashSlope': slope,
                'costIncrease': cost_increase,
                'cumulativeCost': total_cost_increase,
                'newDuration': new_duration,
                'timeSaved': initial_duration - new_duration
            })
            
            current_duration = new_duration
        
        # Final analysis
        final_analysis = self.analyze_current_state()
        
        return {
            'initialDuration': initial_duration,
            'finalDuration': final_analysis['projectDuration'],
            'totalTimeSaved': initial_duration - final_analysis['projectDuration'],
            'totalCostIncrease': total_cost_increase,
            'crashingSteps': crashing_steps,
            'initialCriticalPath': initial_analysis['criticalPath'],
            'finalCriticalPath': final_analysis['criticalPath'],
            # Include full analysis objects for frontend display
            'initialAnalysis': {
                'projectDuration': initial_analysis['projectDuration'],
                'criticalPath': initial_analysis['criticalPath'],
                'activities': initial_analysis['activities']
            },
            'finalAnalysis': {
                'projectDuration': final_analysis['projectDuration'],
                'criticalPath': final_analysis['criticalPath'],
                'activities': final_analysis['activities']
            }
        }
