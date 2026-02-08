from typing import List, Dict, Tuple
from collections import defaultdict, deque
import math

class PERTCPMEngine:
    """Core PERT/CPM calculation engine"""
    
    def __init__(self, activities_data: List[Dict]):
        """
        Initialize with activities data
        Each activity should have: id, duration/optimistic/mostLikely/pessimistic, predecessors
        """
        self.activities = {a['activityId']: a for a in activities_data}
        self.graph = defaultdict(list)  # adjacency list
        self.reverse_graph = defaultdict(list)  # reverse graph
        self.build_graph()
        
    def build_graph(self):
        """Build the project network DAG"""
        # Add all nodes
        for activity_id in self.activities:
            if activity_id not in self.graph:
                self.graph[activity_id] = []
            if activity_id not in self.reverse_graph:
                self.reverse_graph[activity_id] = []
        
        # Add edges based on predecessors
        for activity_id, activity in self.activities.items():
            predecessors = activity.get('predecessors', '')
            if predecessors:
                # Handle string predecessors
                if not isinstance(predecessors, str):
                    predecessors = str(predecessors).strip()
                    
                preds = [p.strip() for p in predecessors.split(',') if p.strip()]
                for pred in preds:
                    if pred not in self.activities:
                        raise ValueError(f"Activity '{activity_id}' references undefined predecessor '{pred}'")
                    self.graph[pred].append(activity_id)
                    self.reverse_graph[activity_id].append(pred)
    
    def validate_dag(self) -> bool:
        """Validate that the graph is a DAG (no cycles)"""
        visited = set()
        rec_stack = set()
        
        def has_cycle(node):
            visited.add(node)
            rec_stack.add(node)
            
            for neighbor in self.graph.get(node, []):
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
        """Calculate or get duration for an activity"""
        activity = self.activities[activity_id]
        
        if 'duration' in activity and activity['duration'] is not None:
            try:
                return float(activity['duration'])
            except (ValueError, TypeError):
                raise ValueError(f"Activity '{activity_id}' has invalid duration: {activity['duration']}")
        
        # PERT formula: (a + 4m + b) / 6
        a = activity.get('optimistic')
        m = activity.get('mostLikely')
        b = activity.get('pessimistic')
        
        if a is not None and m is not None and b is not None:
            try:
                return (float(a) + 4*float(m) + float(b)) / 6
            except (ValueError, TypeError):
                raise ValueError(f"Activity '{activity_id}' has invalid PERT values (optimistic, mostLikely, pessimistic)")
        
        raise ValueError(f"Activity '{activity_id}' has no duration specified (either 'duration' for CPM or 'optimistic', 'mostLikely', 'pessimistic' for PERT)")
    
    def get_variance(self, activity_id: str) -> float:
        """Calculate variance for PERT analysis"""
        activity = self.activities[activity_id]
        
        a = activity.get('optimistic')
        b = activity.get('pessimistic')
        
        if a and b:
            return ((b - a) / 6) ** 2
        return 0
    
    def forward_pass(self) -> Dict[str, Dict]:
        """Calculate ES and EF for all activities"""
        es_ef = {}
        
        # Topological sort to process in order
        in_degree = {node: len(self.reverse_graph[node]) for node in self.activities}
        queue = deque([node for node in self.activities if in_degree[node] == 0])
        
        while queue:
            current = queue.popleft()
            
            # Calculate ES
            if not self.reverse_graph[current]:
                es_ef[current] = {'ES': 0}
            else:
                es_ef[current] = {'ES': max(es_ef[pred]['EF'] for pred in self.reverse_graph[current])}
            
            # Calculate EF
            duration = self.get_duration(current)
            es_ef[current]['EF'] = es_ef[current]['ES'] + duration
            
            # Process successors
            for successor in self.graph[current]:
                in_degree[successor] -= 1
                if in_degree[successor] == 0:
                    queue.append(successor)
        
        return es_ef
    
    def backward_pass(self, project_duration: float) -> Dict[str, Dict]:
        """Calculate LS and LF for all activities"""
        ls_lf = {}
        
        # Reverse topological sort
        out_degree = {node: len(self.graph[node]) for node in self.activities}
        queue = deque([node for node in self.activities if out_degree[node] == 0])
        
        while queue:
            current = queue.popleft()
            
            # Calculate LF
            if not self.graph[current]:
                ls_lf[current] = {'LF': project_duration}
            else:
                ls_lf[current] = {'LF': min(ls_lf[succ]['LS'] for succ in self.graph[current])}
            
            # Calculate LS
            duration = self.get_duration(current)
            ls_lf[current]['LS'] = ls_lf[current]['LF'] - duration
            
            # Process predecessors
            for predecessor in self.reverse_graph[current]:
                out_degree[predecessor] -= 1
                if out_degree[predecessor] == 0:
                    queue.append(predecessor)
        
        return ls_lf
    
    def analyze(self) -> Dict:
        """Perform complete analysis"""
        # Validate DAG (no cycles)
        if not self.validate_dag():
            raise ValueError("Graph contains cycles - check your activity predecessors for circular dependencies")
        
        # Check for connectivity
        start_nodes = [node for node in self.activities if len(self.reverse_graph[node]) == 0]
        end_nodes = [node for node in self.activities if len(self.graph[node]) == 0]
        
        if not start_nodes:
            raise ValueError("No start activity found - ensure at least one activity has no predecessors")
        if not end_nodes:
            raise ValueError("No end activity found - ensure at least one activity has no successors (check for cycles)")
        if len(start_nodes) > 1 or len(end_nodes) > 1:
            # This is technically allowed, but unusual. Add implicit start/end if needed
            pass
        
        # Forward pass
        es_ef = self.forward_pass()
        if not es_ef:
            raise ValueError("Forward pass failed - no activities processed")
            
        project_duration = max(ef['EF'] for ef in es_ef.values()) if es_ef else 0
        
        # Backward pass
        ls_lf = self.backward_pass(project_duration)
        
        # Calculate slack and identify critical path
        critical_activities = []
        for activity_id in self.activities:
            slack = ls_lf[activity_id]['LS'] - es_ef[activity_id]['ES']
            is_critical = abs(slack) < 0.01  # Float comparison with tolerance
            
            if is_critical:
                critical_activities.append(activity_id)
            
            # Store calculated values
            self.activities[activity_id].update({
                'ES': es_ef[activity_id]['ES'],
                'EF': es_ef[activity_id]['EF'],
                'LS': ls_lf[activity_id]['LS'],
                'LF': ls_lf[activity_id]['LF'],
                'slack': slack,
                'isCritical': is_critical
            })
        
        # Find critical path
        critical_path = self.find_critical_path(critical_activities)
        
        # Calculate project variance (only for critical path activities)
        project_variance = sum(self.get_variance(act) for act in critical_activities)
        
        return {
            'projectDuration': project_duration,
            'criticalPath': critical_path,
            'activities': self.activities,
            'projectVariance': project_variance
        }
    
    def find_critical_path(self, critical_activities: List[str]) -> List[str]:
        """Find the actual critical path"""
        # Build subgraph of critical activities
        path = []
        current = None
        
        # Find start node (critical activity with no predecessors)
        for activity_id in critical_activities:
            preds = self.reverse_graph.get(activity_id, [])
            critical_preds = [p for p in preds if p in critical_activities]
            if not critical_preds:
                current = activity_id
                break
        
        if not current:
            return critical_activities[:1] if critical_activities else []
        
        path = [current]
        
        # Traverse through critical path
        visited = {current}
        while current:
            next_node = None
            for successor in self.graph.get(current, []):
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
    
    def get_crash_slope(self, activity_id: str) -> float:
        """Calculate crash slope (cost per unit time)"""
        activity = self.activities[activity_id]
        
        normal_time = self.get_duration(activity_id)
        crash_time = activity.get('crashTime', normal_time)
        normal_cost = activity.get('cost', 0)
        crash_cost = activity.get('crashCost', normal_cost)
        
        if normal_time == crash_time:
            return 0
        
        return (crash_cost - normal_cost) / (normal_time - crash_time)
    
    def calculate_crashing_options(self) -> Dict:
        """Calculate project crashing time-cost tradeoff"""
        analysis = self.analyze()
        
        crashing_options = []
        
        for activity_id in analysis['activities']:
            analyzed_activity = analysis['activities'][activity_id]
            original_activity = self.activities[activity_id]
            
            if not analyzed_activity.get('isCritical'):
                continue
            
            normal_time = self.get_duration(activity_id)
            crash_time = original_activity.get('crashTime')
            
            # Skip if no crash time specified or if crash time is invalid
            if crash_time is None or normal_time <= crash_time:
                continue
            
            crash_slope = self.get_crash_slope(activity_id)
            
            crashing_options.append({
                'activityId': activity_id,
                'activityName': original_activity.get('name', activity_id),
                'normalTime': normal_time,
                'crashTime': crash_time,
                'maxCrashable': normal_time - crash_time,
                'crashSlope': crash_slope,
                'normalCost': original_activity.get('cost', 0),
                'crashCost': original_activity.get('crashCost', 0),
                'isCritical': analyzed_activity.get('isCritical', False)
            })
        
        # Sort by crash slope (cheapest first)
        crashing_options.sort(key=lambda x: x['crashSlope'])
        
        return {
            'projectDuration': analysis['projectDuration'],
            'criticalPath': analysis['criticalPath'],
            'crashingOptions': crashing_options
        }

def calculate_probability(project_duration: float, project_variance: float, deadline: float) -> Dict:
    """Calculate probability of completing by deadline"""
    if project_variance == 0:
        return {
            'probability': 1.0 if deadline >= project_duration else 0.0,
            'zscore': float('inf') if deadline >= project_duration else float('-inf'),
            'stdDeviation': 0
        }
    
    std_deviation = math.sqrt(project_variance)
    z_score = (deadline - project_duration) / std_deviation
    
    # Normal CDF approximation using error function
    # CDF(z) = 0.5 * (1 + erf(z / sqrt(2)))
    probability = 0.5 * (1.0 + math.erf(z_score / math.sqrt(2)))
    
    return {
        'probability': probability,
        'zscore': z_score,
        'stdDeviation': std_deviation
    }
