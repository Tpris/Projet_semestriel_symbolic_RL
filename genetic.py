from validation import *

POP_SIZE = 200
NUM_PARENTS = 100
MUTATION_PROBA = 0.2
MUTATION_FACTOR = 0.5
GENERATIONS = 10


def fitness(path, wall):
    a = path[-1]["hleft"]
    b = path[-1]["hright"]
    if a == None:
        a = 0
    if b == None:
        b = 0
    if is_winning_path(path, wall):
        print("OMG")
        return 10 - 10 * (len(path) / MAX_LENGTH)
    if valid_path(path, wall):
        return 2 - (2 * len(wall) - (a + b)) / (2 * len(wall))
    return 0


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


def select_parents(population, fitness_scores, wall):
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


def mutate(population, wall):
    for path in population:
        if random() < MUTATION_PROBA:
            mutation_index = randint(int(len(path) * MUTATION_FACTOR), len(path) - 1)
            mutation_size = randint(mutation_index, MAX_LENGTH)
            path = path[:mutation_index]
            while len(path) <= mutation_size:
                path = random_extend(path, wall)
    return population


def algo_genetique():
    population = init_population(wall)

    for generation in range(GENERATIONS):
        print(f"Generation : {generation}")
        fitness_scores = fit_population(population, wall)
        parents = select_parents(population, fitness_scores, wall)
        offspring = breed_population(parents)
        offspring = [i for i in offspring if valid_path(i, wall)]
        offspring = fill_population(offspring, wall)
        offspring = mutate(offspring, wall)
        population = offspring

    best_solution = population[fitness_scores.index(max(fitness_scores))]
    print(best_solution)
    return best_solution


path_to_json(algo_genetique())
