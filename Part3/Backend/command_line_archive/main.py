import ibm_db
import patient_queries

# Credentials (sensitive information)
username = "X"
password = "X@2024"
database_name = "X"
hostname = "X"
port = "X"
protocol = "X"
url= f"DATABASE={database_name};HOSTNAME={hostname};PORT={port};PROTOCOL={protocol};UID={username};PWD={password};"

# Connect to the database
conn = ibm_db.connect(url, "", "")

# Main menu option numbers
RETRIEVE_PATIENT_INFORMATION_NUMBER = 1
QUIT_NUMBER = 2

# Main menu options
main_menu = f'''
Select one of the following options:
------------------------------------
{RETRIEVE_PATIENT_INFORMATION_NUMBER}- Retrieve patient information
{QUIT_NUMBER}- Quit
'''

try:
    while(True):

        # Main menu
        print(main_menu)
        
        # Get user input
        choice = input("Enter your choice: ")

        #
        # Input sanitation
        #

        if choice == '1':

            # Get the email as input
            patient_email = input("Enter the email of the patient for which to retrieve the information: ")

            # Retrieve patient information
            patient_queries.retrieve_patient_information(conn, patient_email)
        
        elif choice == '2':
            break
            
        else:
            print("Invalid choice, please try again.")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    print("\nClosing the connection...")
    ibm_db.close(conn)
    print("Connection closed")
    exit(1)
