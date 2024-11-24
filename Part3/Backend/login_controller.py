from __main__ import conn
import ibm_db
from flask import Response
from http import HTTPStatus
from flask import Blueprint
import json

# To make the endpoints in this file visible
login_controller = Blueprint('login_controller', __name__)

@login_controller.route('/login/<string:email>/<string:password>', methods=['GET'])
def login(email, password):
    
    try:
        # Prepare the statements
        sql = '''SELECT * FROM users WHERE email = ? AND password = ?'''
        stmt1 = ibm_db.prepare(conn, sql)
        sql = '''SELECT * FROM patients WHERE email = ?'''
        stmt2 = ibm_db.prepare(conn, sql)

        # Run the first statement
        ibm_db.bind_param(stmt1, 1, email)
        ibm_db.bind_param(stmt1, 2, password)
        ibm_db.execute(stmt1)

        # Fetch the result
        result = ibm_db.fetch_assoc(stmt1)

        # Return an error if the user was not found
        if result == False:
            return Response(f"Incorrect credentials.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        
        ibm_db.bind_param(stmt2, 1, email)
        ibm_db.execute(stmt2)
        result = ibm_db.fetch_assoc(stmt2)

        # The frontend should read the response string and redirect the user to the appropriate menu
        if result == False:
            return Response(json.dumps({"type": "doctor", "email": email}), status=HTTPStatus.OK, mimetype='application/json')
        else:
            return Response(json.dumps({"type": "patient", "email": email}), status=HTTPStatus.OK, mimetype='application/json') # If they're not a doctor, they must be a patient
            
    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')
    
    finally:
        # Always free the statement
        ibm_db.free_stmt(stmt1)
        ibm_db.free_stmt(stmt2)