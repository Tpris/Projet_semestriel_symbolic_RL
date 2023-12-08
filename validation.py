import json
from numpy import sqrt
from itertools import combinations
from random import randint, choice, choices, random
from copy import deepcopy

MAX_LENGTH = 20

path_file = "path_001.json"
wall_file = "wall_001.json"
output_id = "out"
wingspan = 3000


def json_to_path(file):
    """Create a path using a json file

    Args:
        file (string): a json describing a path in the right format

    Returns:
        dict: the said path as a list
    """
    f = open(file)
    data = json.load(f)
    return data['path']

def path_to_json(path):
    """Create a json file reprensenting a path 

    Args:
        path (list): a path you want to convert to json
    """
    json_object = json.dumps({'path':path}, indent=4)
    with open(f"path_{output_id}.json", "w") as outfile:
        outfile.write(json_object)

def json_to_wall(file):
    """Create a wall using a json file

    Args:
        file (string): a json describing a wall in the right format

    Returns:
        list: the said wall as a list
    """
    f = open(file)
    data = json.load(f)
    return data['wall']

def wall_to_json(wall):
    """Create a json file reprensenting a wall 

    Args:
        wall (list): a wall you want to convert to json
    """
    json_object = json.dumps({'wall':wall}, indent=4)
    with open(f"wall_{output_id}.json", "w") as outfile:
        outfile.write(json_object)

wall = json_to_wall(wall_file)

def valid_path(path,wall):
    if not valid_start(path):
        #print(f"The starting step of the path is not valid")
        return False
    if not valid_steps(path,wall):
        #print(f"At least one step of the path is not valid")
        return False
    if not valid_step_transition(path,wall):
        #print(f"At least one transition between two steps of the path is not valid")
        return False

    return True

def valid_start(path):
    """Check if the first step of a path is the default start 

    Args:
        path (list): a path you want to convert to json
    """
    return path[0] == {'hleft': None, 'hright': None, 'lleft': None, 'lright': None}

# distance_dictionnary = {}

# def convert(xa,ya,xb,yb):
#     return str(xa) + "," + str(ya) + "," + str(xb)+ "," + str(yb)

# def distance(xa,ya,xb,yb):
#     """Compute the distance between two points a and b 

#     Args:
#         a,b (dict): a = {x:k,y:l} etc
#     """
#     keys = distance_dictionnary.keys()
#     if convert(xa,ya,xb,yb) not in keys :
#         dist = sqrt((xa-xb)**2+(ya-yb)**2)
#         distance_dictionnary[convert(xa,ya,xb,yb)]=dist
#         distance_dictionnary[convert(xb,yb,xa,ya)]=dist
#         return dist
#     return distance_dictionnary[convert(xa,ya,xb,yb)]

def distance(p1,p2,wall):
    """Compute the distance between two points a and b 

    Args:
        a,b (dict): a = {x:k,y:l} etc
    """
    if p1 is None and p2 is None:
        return 0
    if p1 is None :
        xa = wall[p2]['x']
        ya = 0
        xb = wall[p2]['x']
        yb = wall[p2]['y']
    elif p2 is None :
        xb = wall[p1]['x']
        yb = 0
        xa = wall[p1]['x']
        ya = wall[p1]['y']
    else :
        xa = wall[p1]['x']
        ya = wall[p1]['y']
        xb = wall[p2]['x']
        yb = wall[p2]['y']

    return sqrt((xa-xb)**2+(ya-yb)**2)


def is_started(positions):
    for position in positions:
        if position['x'] != 0 or position['y'] != 0:
            return True
    return False

def is_on_earth(positions):
    return positions[2] == None and positions[3] == None

def body_position(step,wall):
    """Using a wall give the position of each member for a given step  

    Args:
        step (dict), wall (list)
    """
    hleft_position = step['hleft']
    hright_position = step['hright']
    lleft_position = step['lleft']
    lright_position = step['lright']

    return hleft_position, hright_position, lleft_position, lright_position



def valid_wingspans(positions,wall):
    for pos1, pos2 in combinations(positions, 2):
        if distance(pos1, pos2, wall) > wingspan:
            return False
    return True

def valid_step_positions(step,wall):
    """Check if the position of the member of the body is valid (Hands above feet) """

    positions = body_position(step, wall)

    hleft_height = 0.1 if positions[0] is None else wall[positions[0]]['y']
    hright_height = 0.1 if positions[1] is None else wall[positions[1]]['y']
    lleft_height = 0 if positions[2] is None else wall[positions[2]]['y']
    lright_height = 0 if positions[3] is None else wall[positions[3]]['y']

    highest_foot = max(lleft_height,lright_height)
    lowest_hand = min(hleft_height,hright_height)

    return lowest_hand > highest_foot 

def valid_step_wingspan(step, wall):
    positions = body_position(step, wall)
    return valid_wingspans(positions,wall)

    
def valid_step(step,wall):
    return valid_step_wingspan(step,wall) and valid_step_positions(step,wall)



def valid_steps(path,wall):
    for step in path:
        if not valid_step(step,wall):
            return False
    return True


def valid_step_transition(path,wall):
    if len(path) < 1:
        return valid_start(path)
    
    for step_index in range(len(path)-1):

        current_step = path[step_index]
        next_step = path[step_index+1]

        differences = sum(1 for key in current_step if current_step[key] != next_step[key])
        if differences != 1:
            return False
        
        differences = sum(1 for key in current_step if (current_step[key] != None) and (next_step[key] == None))
        if differences != 0:
            return False
        

    return True


# print(valid_path(path,wall))

def is_winning_step(step,wall):
    return step['hleft'] == len(wall) and step['hright'] == len(wall)

def is_winning_path(path,wall):
    return valid_path(path,wall) and is_winning_step(path[-1],wall)

# print(is_winning_path(path,wall))

def legal_moves(step,wall):
    moves = []
    next_step = deepcopy(step)
    for member in ['hleft', 'hright', 'lleft', 'lright']:
        for i in range(len(wall)):
            next_step = deepcopy(step)
            next_step[member] = i
            if valid_step(next_step,wall) and valid_step_transition([step,next_step],wall):
                moves.append(next_step)
    if moves == []:
        print("The wingspan is probably to short for this wall")
    return moves


def random_extend(path,wall):
    step = path[-1]
    moves = legal_moves(step, wall)
    if len(moves) == 0:
        return path
    path.append(choice(moves))
    return path


def create_random_path(wall):
    path = []
    path.append({'hleft': None, 'hright': None, 'lleft': None, 'lright': None})
    step_length = randint(2,MAX_LENGTH-1)
    for i in range(step_length):
        path = random_extend(path,wall)
    return path

# print(create_random_path())