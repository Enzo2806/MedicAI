from flask import Flask
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
from flask_cors import CORS

# Import ibm_db following the instructions here: https://github.com/ibmdb/python-ibmdb/issues/887
virtual_environment_name = "env" # TODO: Replace with your virtual environment name
os.add_dll_directory(os.path.abspath(f"./{virtual_environment_name}/Lib/site-packages/clidriver/bin"))
import ibm_db

# Load a large language model to use
# Fine-tuning code: https://github.com/ankitkapooor/MedBot/tree/main
# TODO: The model is too large for GitHub. 
# Please download it from https://drive.google.com/file/d/1xWejCLRuVIp8IargjzYk-4aT2-Kl8_-v/view?usp=sharing
# Then add it to the model directory before running the code
tokenizer = AutoTokenizer.from_pretrained('Model')
model = AutoModelForCausalLM.from_pretrained('Model')

# Database credentials (sensitive information)
username = "X" 
password = "X"
database_name = "X"
hostname = "X"
port = "X"
protocol = "X"
authentication = "X"
url= f"DATABASE={database_name};HOSTNAME={hostname};PORT={port};PROTOCOL={protocol};UID={username};PWD={password};AUTHENTICATION={authentication};"

# Connect to the database
conn = ibm_db.connect(url, "", "")

# Check if the connection was successful
if conn:
    print("Connection to the database was successful.")

# Setup the Flask app
app = Flask(__name__)
CORS(app, resources={r"/*":{
        "origins":"http://localhost:3000"
    }})

# Register the controllers
from patient_controller import patient_controller
from doctor_controller import doctor_controller
from login_controller import login_controller
from appointment_controller import appointment_controller
app.register_blueprint(patient_controller)
app.register_blueprint(doctor_controller)
app.register_blueprint(login_controller)
app.register_blueprint(appointment_controller)

# Run the app
if __name__ == '__main__':
    try:
        app.run()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        print("\nClosing the connection...")
        ibm_db.close(conn)
        print("Connection closed successfully.")


# TODO: THINGS TO IMPLEMENT:
    
# // A- Functionality

# // Login system page => Leads to patient menu or doctor menu

# // Patient menu
# // 1- Retrieve patient information
# // 2- Retrieve all appointments for the logged in patient
# // 3- Retrieve all the receipts for a given month and year
# // 4- Start a conversation (And wire / hardcore chatbot to respond, and create an appointment with a random doctor => Every message generates a response and sends it back!)
# // 5- See your favorite doctors
# // 6- Quit (This is frontend only)
        
# // Doctor menu
# // 7- Retrieve doctor information
# // 8- Retrieve all appointments for the logged in doctor (Query 1 of last assignmnent), with an option to view the conversation of each
# // 9- Retrieve all the patients that were referred to that doctor (Query 4 of last assignment)
# // 10- Find top performers of the month (Query 5 of last assignment)
# // 11- Retrieve the schedule of the doctor for a given day (Pick a day on a calendar)
# // 12- Quit (This is frontend only)

# // B- Indexes

# // C- Stored procedure