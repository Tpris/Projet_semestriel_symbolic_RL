import json
from numpy import sqrt
from itertools import combinations
from random import randint, choice, choices, random
from copy import deepcopy

MAX_LENGTH = 20

path_file = "path_001.json"
wall_file = "wall_001.json"
output_id = "out"
wingspan = 1000


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


path = json_to_path(path_file)
print(path)
path_to_json(path)
wall = json_to_wall(wall_file)
print(wall)
wall_to_json(wall)

def valid_path(path,wall):
    if not valid_start(path):
        #print(f"The starting step of the path is not valid")
        return False
    if not valid_steps(path,wall):
        #print(f"At least one step of the path is not valid")
        return False
    if not valid_step_distances(path,wall):
        #print(f"At least one transition between two steps of the path is not valid")
        return False

    return True

def valid_start(path):
    """Check if the first step of a path is the default start 

    Args:
        path (list): a path you want to convert to json
    """
    return path[0] == {'hleft': None, 'hright': None, 'lleft': None, 'lright': None}


def distance(a,b):
    """Compute the distance between two points a and b 

    Args:
        a,b (dict): a = {x:k,y:l} etc
    """
    return sqrt((a['x']-b['x'])**2+(a['y']-b['y'])**2)


def corpse_position(step,wall):
    """Using a wall give the position of each member for a given step  

    Args:
        step (dict), wall (list)
    """
    members = []
    for member in step.keys():
        if step[member] == None:
            members.append({'x' : 0, 'y' : 0})
        else : 
            members.append(wall[step[member]-1])

    hleft_position = members[0]
    hright_position = members[1]
    lleft_position = members[2]
    lright_position = members[3]

    return hleft_position, hright_position, lleft_position, lright_position



def valid_wingspans(positions):
    for pos1, pos2 in combinations(positions, 2):
        if distance(pos1, pos2) > wingspan:
            return False
    return True

def valid_step_positions(step,wall):
    """Check if the position of the member of the corpse is valid (Hands above foot) """
    positions = corpse_position(step, wall)
    highest_leg = max(positions[2]['y'],positions[3]['y'])
    return positions[0]['y'] > highest_leg and positions[1]['y'] > highest_leg

def valid_step_wingspan(step, wall):
    positions = corpse_position(step, wall)
    return valid_wingspans(positions)

    
def valid_step(step,wall):
    return valid_step_wingspan(step,wall) and valid_step_positions(step,wall)



def valid_steps(path,wall):
    for step in path:
        if not valid_step(step,wall):
            return False
    return True


def valid_step_distances(path,wall):
    positions = []
    if len(path) > 1:
        for step_index in range(len(path)-1):

            positions = list(corpse_position(path[step_index], wall))
            
            for i in corpse_position(path[step_index+1], wall) : 
                positions.append(i)
            if not valid_wingspans(positions):
                return False
    else :
        return valid_start(path)
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

            if valid_steps([step,next_step],wall) and valid_step_distances([step,next_step],wall):
                moves.append(next_step)

    return moves


def random_extend(path,wall):
    step = path[-1]
    moves = legal_moves(step,wall)
    path.append(choice(moves))
    return path


def create_random_path(wall):
    path = []
    path.append({'hleft': None, 'hright': None, 'lleft': None, 'lright': None})
    step_lengh = randint(2,MAX_LENGTH-1)
    for i in range(step_lengh):
        path = random_extend(path,wall)
    return path

# print(create_random_path())