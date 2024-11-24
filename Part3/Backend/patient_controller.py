from __main__ import conn, tokenizer, model
import ibm_db
from flask import Response
from http import HTTPStatus
from flask import Blueprint
import json
import random
import datetime

# To make the endpoints in this file visible
patient_controller = Blueprint('patient_controller', __name__)

@patient_controller.route('/patient/<string:email>', methods=['GET'])
def retrieve_patient_information(email):
    try:
        sql = """
        SELECT u.first_name, u.last_name, u.email, u.password, u.preferred_language, p.health_insurance_number, p.credit_card_expiry_date, p.credit_card_number
        FROM patients p, users u
        WHERE p.email = u.email AND u.email = ?
        """

        # Prepares the SQL query for execution against the database
        stmt = ibm_db.prepare(conn, sql)

        # First, check if the patient exists
        if fetch_patient(email) is None:
            return Response(f"Patient with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        
        # Binds the ipnut
        ibm_db.bind_param(stmt, 1, email)

        # Executes the prepared statement with the bound parameters
        ibm_db.execute(stmt)

        result = ibm_db.fetch_assoc(stmt)

        if result is None:
            return Response(f"Patient with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        else:
            return Response(json.dumps(result, default=str), status=HTTPStatus.OK, mimetype='application/json')
    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')


@patient_controller.route('/patient/receipts/<string:email>/<int:year>/<int:month>', methods=['GET'])
def retrieve_receipts(email, year, month):
    try:
        
        sql = """
        SELECT a.date, r.receipt_id, r.service_cost, r.cancellation_fee, r.tax_amount, r.insurance_payout, r.final_cost
        FROM chatbotconversations c, appointments a, receipts r
        WHERE a.conversation_id = c.conversation_id
        AND r.appointment_id = a.appointment_id
        AND c.patient_email = ?
        AND MONTH(a.date) = ?
        AND YEAR(a.date) = ?
        ORDER BY a.date;
        """

        # Prepares the SQL query for execution against the database
        stmt = ibm_db.prepare(conn, sql)

        # Binds the ipnut
        ibm_db.bind_param(stmt, 1, email)
        ibm_db.bind_param(stmt, 2, month)
        ibm_db.bind_param(stmt, 3, year)

        # Executes the prepared statement with the bound parameters
        ibm_db.execute(stmt)

        receipts = []
        result = ibm_db.fetch_assoc(stmt)
        while result:
            receipts.append(result)
            result = ibm_db.fetch_assoc(stmt)

        # Checks if no appointments were found (empty list) and returns an error
        if len(receipts) == 0:
            return Response(f"No receipts found for {email} in {year}/{month}.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        # If appointments were found, serializes the list to JSON and returns it 
        return Response(json.dumps(receipts, default=str), status=HTTPStatus.OK, mimetype='application/json')

    except Exception as e:
        # If an exception occurs during query execution
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')

    finally:
        # Ensures the database statement is always freed 

        ibm_db.free_stmt(stmt)

@patient_controller.route('/patient/conversation/<string:email>', methods=['POST'])
def create_conversation(email):
    try:
    
        # Write the query
        sql = '''INSERT INTO chatbotconversations (conversation_id, patient_email) 
                VALUES (?, ?)'''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        #  Bind the parameters
        conversation_id = random.randint(1, 1000000) # Generate a random id for the conversation
        ibm_db.bind_param(stmt, 1, conversation_id) 
        ibm_db.bind_param(stmt, 2, email)

        # Execute the statement
        ibm_db.execute(stmt)

        # Return a 200 ok response with the conversation id
        return Response(str(conversation_id), status=HTTPStatus.OK, mimetype='application/json')

    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')
    
    finally: # Always free the statement
        ibm_db.free_stmt(stmt)

@patient_controller.route('/patient/conversation/<int:conversation_id>/<string:message>', methods=['POST'])
def send_message(conversation_id, message):
    try:
        
        # Save the user's message
        sql = '''INSERT INTO messages (conversation_id, sending_time, message_content, is_sent_by_chatbot)
                VALUES (?, ?, ?, ?)'''
        stmt = ibm_db.prepare(conn, sql)
        ibm_db.bind_param(stmt, 1, conversation_id) 
        ibm_db.bind_param(stmt, 2, datetime.datetime.now())
        ibm_db.bind_param(stmt, 3, message)
        ibm_db.bind_param(stmt, 4, False)
        ibm_db.execute(stmt)
        
        # TODO: LATER
        # Query all the previous messages in the conversation
        # Creates a string with the full conversation history and, additionally, the new message, to use for generating the next message in the conversation
        # sql = '''SELECT * FROM messages WHERE conversation_id = ? ORDER BY sending_time'''
        # stmt = ibm_db.prepare(conn, sql)
        # ibm_db.bind_param(stmt, 1, conversation_id)
        # ibm_db.execute(stmt)
        # full_conversation_history = ""
        # result = ibm_db.fetch_assoc(stmt)
        # while result != False:
        #     full_conversation_history += ('<|USER|> ' if not result['IS_SENT_BY_CHATBOT'] else '<|ASSISTANT|> ') + result['MESSAGE_CONTENT'] + "\n"
        #     result = ibm_db.fetch_assoc(stmt)
        # full_conversation_history += f'<|USER|> {message}\n'
        # full_conversation_history += f'<|ASSISTANT|> '

        # TODO: LATER
        # # Query all the doctors in the system
        # # Creates a string of each doctor's name and their specialization
        # sql = '''SELECT * FROM doctors, users WHERE doctors.email = users.email''' # Join cause the name is in users
        # stmt = ibm_db.prepare(conn, sql)
        # ibm_db.execute(stmt)
        # all_doctors = ""
        # result = ibm_db.fetch_assoc(stmt)
        # while result != False:
        #     all_doctors += f"{result['FIRST_NAME']} {result['LAST_NAME']}: {result['SPECIALIZATION']}\n"
        #     result = ibm_db.fetch_assoc(stmt)

        prompt_text = f'Question: {message}\nAnswer:'
        encoded_prompt = tokenizer.encode(prompt_text,
                                        add_special_tokens = False,
                                        return_tensors = 'pt')
        prompt_length = encoded_prompt.shape[1]
        output_sequence = model.generate(
            input_ids = encoded_prompt,
            max_length = 100,
            temperature = 0.9,
            top_k = 20,
            top_p = 0.9,
            repetition_penalty = 1,
            do_sample = True,
            num_return_sequences = 1
        )[0]
        output_sequence = tokenizer.decode(output_sequence[prompt_length:])
        
        if '<|endoftext|>' in output_sequence:
            output_sequence = output_sequence[:output_sequence.index('<|endoftext|>')]

        # Generate the chatbot's response
        chatbot_response = output_sequence

        # Save the chatbot's response
        sql = '''INSERT INTO messages (conversation_id, sending_time, message_content, is_sent_by_chatbot)
                VALUES (?, ?, ?, ?)'''
        stmt = ibm_db.prepare(conn, sql)
        ibm_db.bind_param(stmt, 1, conversation_id) 
        ibm_db.bind_param(stmt, 2, datetime.datetime.now())
        ibm_db.bind_param(stmt, 3, chatbot_response)
        ibm_db.bind_param(stmt, 4, True)
        ibm_db.execute(stmt)

        # Return a 200 ok response with the chatbot's response
        return Response(chatbot_response, status=HTTPStatus.OK, mimetype='application/json')

    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')
    
    finally:
        ibm_db.free_stmt(stmt)

@patient_controller.route('/patient/favoritedoctors/<string:email>', methods = ["GET"])
def get_favorite_doctors(email):
    try:
        # Write the query
        sql = '''SELECT doctor_email FROM favorites WHERE patient_email = ?'''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # First, check if the patient exists
        if fetch_patient(email) is None:
            return Response(f"Patient with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        
        #  Bind the parameters
        ibm_db.bind_param(stmt, 1, email)

        # Execute the statement
        ibm_db.execute(stmt)

        # Initialize an empty list to hold the results
        results = []

        # Fetch the first row
        row = ibm_db.fetch_assoc(stmt)

        # Loop through all the rows and append each to the results list
        while row:
            results.append(row)
            row = ibm_db.fetch_assoc(stmt)
        
        # Return the results as a JSON response
        return Response(json.dumps(results, default=str), status=HTTPStatus.OK, mimetype='application/json')
    
    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')
    finally:
        ibm_db.free_stmt(stmt)

@patient_controller.route("/patient/appointments/<string:email>", methods=["GET"])
def get_appointments(email):
    try:
        # Write the query
        sql = '''
        SELECT a.appointment_id, a.date, a.start_time, a.end_time, a.meeting_link, a.is_cancelled
        FROM patients p,
            chatbotconversations c,
            appointments a
        WHERE a.conversation_id = c.conversation_id
        AND c.patient_email = p.email
        AND p.email = ?
        ORDER BY a.date;
        '''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # First, check if the patient exists
        if fetch_patient(email) is None:
            return Response(f"Patient with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        
        #  Bind the parameters
        ibm_db.bind_param(stmt, 1, email)

        # Execute the statement
        ibm_db.execute(stmt)

        # Initialize an empty list to hold the results
        results = []

        # Fetch the first row
        row = ibm_db.fetch_assoc(stmt)

        # Loop through all the rows and append each to the results list
        while row:
            results.append(row)
            row = ibm_db.fetch_assoc(stmt)
        
        # Return the results as a JSON response
        return Response(json.dumps(results, default=str), status=HTTPStatus.OK, mimetype='application/json')
    
    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')
    finally:
        ibm_db.free_stmt(stmt)
        
#
# HELPER FUNCTION
#
        
# Function to fetch a patient
def fetch_patient(email):
    try:
        # Write the query
        sql = '''SELECT * FROM patients WHERE email = ?'''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # Bind the parameters
        ibm_db.bind_param(stmt, 1, email)

        # Execute the statement
        ibm_db.execute(stmt)

        # Fetch the result
        result = ibm_db.fetch_assoc(stmt)

        # Return the result if found, else None
        if result:
            return result
        else:
            return None

    except Exception as e:
        raise e
    finally:
        ibm_db.free_stmt(stmt)
