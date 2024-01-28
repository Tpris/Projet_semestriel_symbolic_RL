import numpy as np
from validation import *

wall = json_to_wall("./data/wall/wall_test.json")

Nb_handhold = len(wall)


def state_to_index(state):
    a = state["hleft"]
    if a == None :
        a = 0
    else :
        a = a+1

    b = state["hright"]
    if b == None :
        b = 0
    else :
        b = b+1

    c = state["lleft"]
    if c == None :
        c = 0
    else :
        c = c+1

    d = state["lright"]
    if d == None :
        d = 0
    else :
        d = d+1

    numerical_representation = a + 10 * b + 100 * c + 1000 * d
    return numerical_representation

def index_to_action(action_index):
    d = action_index // 1000
    c = (action_index - d * 1000 ) // 100 
    b = (action_index - d * 1000 - c * 100) // 10 
    a = (action_index - d * 1000 - c * 100 - b * 10) 

    
    if a == 0 :
        a = None
    else :
        a = a-1

    if b == 0 :
        b = None
    else :
        b = b-1


    if c == 0 :
        c = None
    else :
        c = c-1


    if d == 0 :
        d = None
    else :
        d = d-1

    limb_movement = {"hleft": a,"hright": b,"lleft" : c, "lright" : d}

    return limb_movement


initial_state = {"hleft": None, "hright": None, "lleft": None, "lright": None}


# Initialize Q-table
num_states = (Nb_handhold + 1) ** 4
num_actions = (Nb_handhold + 1) * 4
Q = {}

def update_Q():
    global Q
    Q = {}


def calculate_total_states(state, wall) :

    if state_to_index(state) not in Q :

        moves = legal_moves(state,wall)
        Q[state_to_index(state)] = {}

        for child_state in moves:
            Q[state_to_index(state)][state_to_index(child_state)] = 0
            calculate_total_states(child_state,wall)
    else : 
        return




# Q-learning parameters
gamma = 0.9
learning_rate = 0.1
epsilon = 0.1







def calculate_reward(current_state, next_state, wall):
    reward = 0
    if valid_step(next_state,wall) and valid_step_transition([current_state,next_state],wall) and next_state != initial_state:
        hleft, hright, lleft, lright = body_position(next_state,wall)
        reward =   1 / (1 + (distance(len(wall)-1,hright,wall)+distance(len(wall)-1,hleft,wall)    ))# +distance(len(wall)-1,lright,wall)+distance(len(wall)-1,lleft,wall)))

    return reward


def generate_policy(Q, state):
    state_index = state_to_index(state)
    action_index = np.argmax(Q[state_index, :])
    selected_action = index_to_action(action_index)
    return selected_action


def choose_action(state):
    # Exploration-Exploitation
    if np.random.rand() > epsilon:
        # Exploitation: Choose action with the highest Q-value
        legal_actions = Q[state_to_index(state)].keys()
        chosen_action = max(legal_actions, key=lambda action: Q[state_to_index(state)][action])
    else:
        # Exploration: Choose a random action
        chosen_action = np.random.choice(list(Q[state_to_index(state)].keys()))

    return chosen_action


# Main Q-learning loop
def Q_learning():
    num_episodes = 100000  # You can adjust the number of episodes
    max_steps_per_episode = 30  # Add a termination condition based on the maximum number of steps

    for episode in range(num_episodes):
        current_state = initial_state.copy()

        # Ensure the current state is in the Q dictionary
        if state_to_index(current_state) not in Q:
            Q[state_to_index(current_state)] = {}

        step = 0
        while step < max_steps_per_episode:
            # Choose action
            chosen_action = choose_action(current_state)

            # Perform action, calculate reward, and update state
            next_state = index_to_action(chosen_action)
            immediate_reward = calculate_reward(current_state, next_state, wall)

            # Ensure the next state is in the Q dictionary
            if state_to_index(next_state) not in Q:
                Q[state_to_index(next_state)] = {}

            # Update Q-value
            Q[state_to_index(current_state)][state_to_index(next_state)] += (
                learning_rate
                * (immediate_reward + gamma * max(Q[state_to_index(next_state)].values(), default=0) - Q[state_to_index(current_state)][state_to_index(next_state)])
            )

            current_state = next_state

            # Check for termination conditions (you may need to customize this)
            if is_winning_step(current_state,wall):
                break

            step += 1
        




def perform_Q_policy(wall):
    Nb_handhold = len(wall)
    calculate_total_states(initial_state,wall)
    Q_learning()
    path = [initial_state]
    counter = 0
    print(len(wall))

    while len(path) <= 20:  
        state_index = state_to_index(path[-1])

        if state_index not in Q or not Q[state_index]:  
            break

        legal_actions = list(Q[state_index].keys())
        q_values = [Q[state_index][action] for action in legal_actions]
        chosen_action = legal_actions[np.argmax(q_values)]

        path.append(index_to_action(chosen_action))

        if is_winning_path(path,wall):
            break

    print("Final Path:", is_winning_path(path, wall),path)
    return path


perform_Q_policy(Q, wall)


