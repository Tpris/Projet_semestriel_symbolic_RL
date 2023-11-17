import json
from numpy import sqrt
from itertools import combinations

path_file = "path_001.json"
wall_file = "wall_001.json"
output_id = "out"
wingspan = 2


def json_to_path(file):
    """Create a path using a json file

    Args:
        file (string): a json describing a path in the right format

    Returns:
        dict: the said path as a dictionnary
    """
    f = open(file)
    data = json.load(f)
    return data['path']

def path_to_json(path):
    """Create a json file reprensenting a path 

    Args:
        path (dict): a path you want to convert to json
    """
    json_object = json.dumps({'path':path}, indent=4)
    with open(f"path_{output_id}.json", "w") as outfile:
        outfile.write(json_object)

def json_to_wall(file):
    """Create a wall using a json file

    Args:
        file (string): a json describing a wall in the right format

    Returns:
        dict: the said wall as a dictionnary
    """
    f = open(file)
    data = json.load(f)
    return data['wall']



def wall_to_json(wall):
     """Create a json file reprensenting a wall 

    Args:
        wall (dict): a wall you want to convert to json
    """
    json_object = json.dumps({'wall':wall}, indent=4)
    with open(f"wall_{output_id}.json", "w") as outfile:
        outfile.write(json_object)

### Tests ###

path = json_to_path(path_file)
print(path)
path_to_json(path)
wall = json_to_wall(wall_file)
print(wall)
wall_to_json(wall)

### End Tests ###

def valid_path(path,wall):
    if not valid_start(path):
        print(f"The starting step of the path is not valid")
        return False
    if not valid_steps(path,wall):
        print(f"At least one step of the path is not valid")
        return False
    if not valid_step_distances(path,wall):
        print(f"At least one transition between two steps of the path is not valid")
    return True

def valid_start(path):
    return path[0] == {'hleft': None, 'hright': None, 'lleft': None, 'lright': None}


def compute_wingspan(a,b):
    return sqrt((a['x']-b['x'])**2+(a['y']-b['y'])**2)


def corpse_position(step,wall):
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
        if compute_wingspan(pos1, pos2) > wingspan:
            return False

    return True


def valid_step_wingspan(step, wall):

    positions = corpse_position(step, wall)

    return valid_wingspans(positions)

    
def valid_step(step,wall):
    if not valid_step_wingspan(step,wall):
        return False
    

    return True

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
            print(positions)
            if not valid_wingspans(positions):
                return False
    else :
        return valid_start(path)
    return True

print(valid_path(path,wall))