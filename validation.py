import json
from numpy import sqrt
from itertools import combinations
from random import randint, choice, choices, random
from copy import deepcopy

MAX_LENGTH = 20
POP_SIZE = 20
NUM_PARENTS = 10
MUTATION_PROBA = 0.2
MUTATION_FACTOR = 0.5
GENERATIONS = 100

path_file = "path_001.json"
wall_file = "wall_001.json"
output_id = "out"
wingspan = 3


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


path = json_to_path(path_file)
# print(path)
# path_to_json(path)
wall = json_to_wall(wall_file)
# print(wall)
# wall_to_json(wall)


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
            # print(positions)
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

def fitness(path,wall):
    a = path[-1]['hleft']
    b = path[-1]['hright']
    if a == None:
        a=0
    if b == None:
        b=0
    if is_winning_path(path,wall) :
        return 10
    if valid_path(path,wall) :
        return (2-(2*len(wall)-(a+b))/(2*len(wall)))#/len(path)
    return 0

def crossover(path1, path2):
    cut = randint(1, min(len(path1), len(path2)))
    new_path_1 = path1[:cut] + path2[cut:]
    new_path_2 = path2[:cut] + path1[cut:]

    return new_path_1, new_path_2

# a,b = crossover(path,path)
# print(a==path)

def init_population(wall):
    population = [create_random_path(wall) for _ in range(POP_SIZE)]
    return population

def fill_population(population, wall):
    for _ in range(POP_SIZE-len(population)):
        population.append(create_random_path(wall))
    return population

def fit_pop(population,wall):
    fitted_pop = []
    for path in population:
        fitted_pop.append(fitness(path,wall))
    return fitted_pop

def select_parents(population, fitness_scores,wall):

    selected_parents = []

    for _ in range(NUM_PARENTS):

        selected_index = choices(range(len(population)), weights=fitness_scores)
        selected_parents.append(population[selected_index[0]])

    return selected_parents

def breed_population(parents):
    offspring = []

    if len(parents) % 2 != 0:
        raise ValueError("The number of parents must be even for crossover.")

    for i in range(0, len(parents), 2):
        parent1 = parents[i]
        parent2 = parents[i + 1]

        child1, child2 = crossover(parent1, parent2)

        offspring.append(child1)
        offspring.append(child2)

    return offspring

def mutate(population,wall):
    for path in population :
        if random() < MUTATION_PROBA :
            mutation_index = randint(int(len(path)*MUTATION_FACTOR),len(path)-1)
            mutation_size = randint(mutation_index,MAX_LENGTH)
            path = path[:mutation_index]
            while len(path) <= mutation_size:
                path = random_extend(path,wall)
    return population


population = init_population(wall)


for generation in range(GENERATIONS):
    print(f"Generation : {generation}")
    fitness_scores = fit_pop(population,wall)
    parents = select_parents(population, fitness_scores,wall)
    offspring = breed_population(parents)
    offspring = [i for i in offspring if valid_path(i,wall)]
    offspring = fill_population(offspring, wall)
    offspring = mutate(offspring,wall)
    population = offspring


best_solution = population[fitness_scores.index(max(fitness_scores))]
print(best_solution)