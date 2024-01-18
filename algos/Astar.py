import heapq
from algos.validation import *
import time
from math import ceil
from codecarbon import EmissionsTracker

class Human:
    
    wall = None
    def __init__(self, state=None, wall=None) -> None:
        if state:
            self.hleft = state["hleft"]
            self.hright = state["hright"]
            self.lleft = state["lleft"]
            self.lright = state["lright"]
        else:
            self.hleft = None
            self.hright = None
            self.lleft = None
            self.lright = None
        if wall:
            self.wall = wall

    def heuristic(self):
        wingspan = get_wingspan()
        return distance(len(self.wall)-1, self.hright, self.wall)/wingspan + distance(len(self.wall)-1, self.hleft, self.wall)/wingspan
    
    def get_step(self):
        return {"hleft": self.hleft, "hright": self.hright, "lleft": self.lleft, "lright": self.lright}

    def next(self):
        for step in legal_moves(self.get_step(), self.wall):
            yield step

    def solved(self):
        return self.hleft == len(self.wall)-1 and self.hright == len(self.wall)-1

class Node:
    def __init__(self, state, father=None, g=0, f=0) -> None:
        self.state = state
        self.father = father
        self.g = g
        self.f = f
        
    def solved(self):
        return Human(self.state).solved()

    def heuristic(self):
        return Human(self.state).heuristic()

    def next(self):
        for human in Human(self.state).next():
            yield human

    def __lt__(self, other):
        return self.f < other.f
    
class A_star:
    
    def __init__(self) -> None:
        self.frontier = []
        heapq.heapify(self.frontier)
        self.closed = {}
    
    def add(self, state, father=None, g=0, f=0):
        heapq.heappush(self.frontier, (f, Node(state, father, g, f)))
        self.closed[tuple(sorted(state.items()))] = g
    
    def solve(self):
        while self.frontier:
            _, node = heapq.heappop(self.frontier)
            
            if node.g > MAX_LENGTH:
                continue
        
            if node.solved():
                return node
            
            for state in node.next():
                hash_state = tuple(sorted(state.items()))
                if hash_state not in self.closed or self.closed[hash_state] > node.g + 1:
                    self.add(state, father=node, g=node.g+1, f=node.g+Human(state).heuristic())
                    
        return None
    
def Astar_solve_wall(wall):
    # Create Carbon tracker
    tracker = EmissionsTracker()
    #if offline, it is possible to specify measurement specifications
    #tracker = OfflineEmissionsTracker(country_iso_code='SGP', cloud_provider='gcp',  cloud_region='asia-southeast1', log_level='error')

    tracker.start()
    
    Human.wall = wall
    solver = A_star()
    solver.add({"hleft": None, "hright": None, "lleft": None, "lright": None})
    finalStep = solver.solve()  
    solution = []
    while finalStep:
        solution.append(finalStep.state)
        finalStep = finalStep.father
    solution.reverse()
    print(solution)

    emissions: float = tracker.stop()
    print('-----------------------------------------------------')
    print('Total CPU energy consumption CodeCarbon (Process): ' + str(tracker._total_cpu_energy.kWh*1000) + ' Wh')
    print('Total RAM energy consumption CodeCarbon (Process): ' + str(tracker._total_ram_energy.kWh*1000) + ' Wh')
    print('Total GPU energy consumption CodeCarbon (Process): ' + str(tracker._total_gpu_energy.kWh*1000) + ' Wh')
    print('Total Energy consumption CodeCarbon (Process): ' + str(tracker._total_energy.kWh*1000) + ' Wh')
    print('Emissions by CodeCarbon (Process): '+ str(emissions*1000) + ' gCO2e')

    return solution