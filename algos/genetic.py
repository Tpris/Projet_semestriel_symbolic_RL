from algos.validation import *
import time
from codecarbon import EmissionsTracker
POP_SIZE = 200
NUM_PARENTS = 50
MUTATION_PROBA = 0.2
MUTATION_FACTOR = 0.5
GENERATIONS = 2



# def fitness(path, wall):
#     a = path[-1]["hleft"]
#     b = path[-1]["hright"]
#     if a == None:
#         a = 0
#     if b == None:
#         b = 0
#     if is_winning_path(path, wall):
#         print("OMG")
#         return 10*(1 - 0.9*(len(path) / MAX_LENGTH))
#     if valid_path(path, wall):
#         return  (a + b) / (2*len(wall))
#     return 0

def fitness(path, wall):
    hleft, hright, _,_ = body_position(path[-1],wall)

    if is_winning_path(path, wall):
        print("WINNNNN")
    if valid_path(path, wall):
        return (distance(len(wall)-1,hright,wall)+distance(len(wall)-1,hleft,wall))/2 
    return float('inf')

def crossover(path1, path2):
    cut = randint(1, min(len(path1), len(path2)))
    new_path_1 = path1[:cut] + path2[cut:]
    new_path_2 = path2[:cut] + path1[cut:]

    return new_path_1, new_path_2


def init_population(wall):
    population = [create_random_path(wall) for _ in range(POP_SIZE)]
    return population


def fill_population(population, wall):
    for _ in range(POP_SIZE - len(population)):
        population.append(create_random_path(wall))
    return population


def fit_population(population, wall):
    fitted_pop = []
    for path in population:
        fitted_pop.append(fitness(path, wall))
    return fitted_pop


# def select_parents(population, fitness_scores):
#     selected_parents = []

#     for _ in range(NUM_PARENTS):
#         selected_index = choices(range(len(population)), weights=fitness_scores)
#         selected_parents.append(population[selected_index[0]])

#     return selected_parents


def select_parents(population):

    selected_parents = population[:NUM_PARENTS]
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


def mutate(population, wall):
    for path in population:
        if random() < MUTATION_PROBA:
            mutation_index = randint(int(len(path) * MUTATION_FACTOR), len(path) - 1)
            mutation_size = randint(mutation_index, MAX_LENGTH)
            path = path[:mutation_index]
            for i in range(len(path), mutation_size+1):
                path = random_extend(path, wall)
    return population


def algo_genetique(wall):
    # Create Carbon tracker
    tracker = EmissionsTracker()
    #if offline, it is possible to specify measurement specifications
    #tracker = OfflineEmissionsTracker(country_iso_code='SGP', cloud_provider='gcp',  cloud_region='asia-southeast1', log_level='error')

    tracker.start()

    timer = time.time()
    population = init_population(wall)
    population.sort(key=lambda x: fitness(x, wall))
    for generation in range(GENERATIONS):
        print(f"Generation : {generation}")
        new_population = population[:NUM_PARENTS]
        offspring = breed_population(new_population)
        
        # offspring = [i for i in offspring if valid_path(i, wall)]
        offspring = mutate(offspring, wall)
        new_population.extend(offspring)
        new_population = fill_population(new_population, wall)
   
        population = new_population
        population.sort(key=lambda x: fitness(x, wall))

    print(fit_population(population, wall))
    best_solution = population[0]
    print(best_solution)
    time_taken = time.time() - timer
    print(time_taken)

    emissions: float = tracker.stop()
    print('-----------------------------------------------------')
    print('Total CPU energy consumption CodeCarbon (Process): ' + str(tracker._total_cpu_energy.kWh*1000) + ' Wh')
    print('Total RAM energy consumption CodeCarbon (Process): ' + str(tracker._total_ram_energy.kWh*1000) + ' Wh')
    print('Total GPU energy consumption CodeCarbon (Process): ' + str(tracker._total_gpu_energy.kWh*1000) + ' Wh')
    print('Total Energy consumption CodeCarbon (Process): ' + str(tracker._total_energy.kWh*1000) + ' Wh')
    print('Emissions by CodeCarbon (Process): '+ str(emissions*1000) + ' gCO2e')
    
    return best_solution


