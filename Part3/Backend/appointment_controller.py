from __main__ import conn
import ibm_db
from flask import Response
from http import HTTPStatus
from flask import Blueprint
import json

# To make the endpoints in this file visible
appointment_controller = Blueprint('appointment_controller', __name__)

@appointment_controller.route('/appointment/conversation/<int:appointment_id>')
def get_conversation(appointment_id):
    try:
        # Write the query
        sql = '''
        SELECT m.sending_time, m.message_content, m.is_sent_by_chatbot
        FROM messages m,
            appointments a
        WHERE a.conversation_id = m.conversation_id
        AND a.appointment_id = ?
        ORDER BY m.sending_time;
        '''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # Check that the doctor exists
        if fetch_appointment(appointment_id) is None:
            return Response(f"Appointment with id {appointment_id} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        # Bind the parameters
        ibm_db.bind_param(stmt, 1, appointment_id)

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

        if len(results) == 0:
            return Response(f"The associated conversation has no messages.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        
        # Return the results as a JSON response
        return Response(json.dumps(results, default=str), status=HTTPStatus.OK, mimetype='application/json')

    except Exception as e:
        raise e
    finally: # Always free the statement
        ibm_db.free_stmt(stmt)

#
# HELPER FUNCTIONS
#
        
def fetch_appointment(appointment_id):
    try:
        # Write the query
        sql = '''SELECT * FROM appointments WHERE appointment_id = ?'''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # Bind the parameters
        ibm_db.bind_param(stmt, 1, appointment_id)

        # Execute the statement
        ibm_db.execute(stmt)

        # Fetch the result
        result = ibm_db.fetch_assoc(stmt)

        # Check if the result was found and return it or None
        if result:
            return result
        else:
            return None

    except Exception as e:
        raise e
    finally: # Always free the statement
        ibm_db.free_stmt(stmt)
