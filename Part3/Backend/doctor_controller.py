from __main__ import conn
import ibm_db
from flask import Response
from http import HTTPStatus
from flask import Blueprint
import json
from datetime import date, datetime

# To make the endpoints in this file visible
doctor_controller = Blueprint('doctor_controller', __name__)

@doctor_controller.route('/doctor/<string:email>', methods=['GET'])
def retrieve_doctor_information(email):
    try:
        sql = """
        SELECT u.first_name, u.last_name, u.email, u.password, u.preferred_language, d.specialization, d.price_per_hour
        FROM doctors d, users u
        WHERE d.email = u.email AND u.email = ?
        """

        # Prepares the SQL query for execution against the database
        stmt = ibm_db.prepare(conn, sql)

        # First, check if the doctor exists
        if fetch_doctor(email) is None:
            return Response(f"Doctor with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        
        # Binds the ipnut
        ibm_db.bind_param(stmt, 1, email)

        # Executes the prepared statement with the bound parameters
        ibm_db.execute(stmt)

        result = ibm_db.fetch_assoc(stmt)

        if result is None:
            return Response(f"Doctor with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        else:
            return Response(json.dumps(result, default=str), status=HTTPStatus.OK, mimetype='application/json')
    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')

@doctor_controller.route('/doctor/appointments/<string:email>', methods=['GET'])
def get_appointments(email):
    try:
        # Write the query
        sql = '''
        SELECT a.appointment_id, a.date, a.start_time, a.end_time, a.meeting_link, a.is_cancelled, c.patient_email
        FROM doctors d,
            appointments a,
            chatbotconversations c
        WHERE a.doctor_email = d.email
        AND a.conversation_id = c.conversation_id
        AND d.email = ?
        ORDER BY a.date;
        '''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # Check that the doctor exists
        if fetch_doctor(email) is None:
            return Response(f"Doctor with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        # Bind the parameters
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

        if len(results) == 0:
            return Response(f"Doctor with email {email} has no appointments.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')
        
        # Return the results as a JSON response
        return Response(json.dumps(results, default=str), status=HTTPStatus.OK, mimetype='application/json')

    except Exception as e:
        raise e
    finally: # Always free the statement
        ibm_db.free_stmt(stmt)

@doctor_controller.route('/doctor/schedule/<string:email>', defaults={'myDate': date.today()}, methods=['GET'])
@doctor_controller.route('/doctor/schedule/<string:email>/<string:myDate>', methods=['GET'])
def get_schedule(email, myDate):
    try:    
        # Write the query to check if the given date is a special schedule
        sql = '''
        WITH fulldayschedules(is_working_day, day_start_time, lunch_start_time, lunch_end_time, day_end_time, date,
                            day_of_the_week) AS
                (SELECT is_working_day, day_start_time, lunch_start_time, lunch_end_time, day_end_time, date, day_of_the_week
                FROM (SELECT COALESCE(s.schedule_id, r.schedule_id) schedule_id, s.date, r.day_of_the_week
                        FROM regulardayschedules r
                                FULL OUTER JOIN specialdayschedules s ON r.schedule_id = s.schedule_id) sr
                        INNER JOIN dayschedules d ON d.schedule_id = sr.schedule_id
                WHERE d.doctor_email = ?)

            (SELECT is_working_day,
                    get_day_of_week_name(DAYOFWEEK(date)) day_of_the_week,
                    day_start_time,
                    lunch_start_time,
                    lunch_end_time,
                    day_end_time,
                    1                                     is_special_day
            FROM fulldayschedules
            WHERE date = ?

            UNION ALL

            SELECT is_working_day,
                    day_of_the_week,
                    day_start_time,
                    lunch_start_time,
                    lunch_end_time,
                    day_end_time,
                    0 is_special_day
            FROM fulldayschedules
            WHERE day_of_the_week IS NOT NULL
            AND day_of_the_week = ?)
            ORDER BY is_special_day DESC
            LIMIT 1;
        '''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        create_schedule_functions()

        # Check that the doctor exists
        if fetch_doctor(email) is None:
            return Response(f"Doctor with email {email} was not found.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        # Make sure the date is in Date Object format
        if not isinstance(myDate, date):
            date_object = datetime.strptime(myDate, '%Y-%m-%d')
        else:
            date_object = myDate
        
        # Get the day of the week corresponding to the passed date
        day_of_week = date_object.strftime('%A')

        # Bind the parameters
        ibm_db.bind_param(stmt, 1, email)
        ibm_db.bind_param(stmt, 2, myDate)
        ibm_db.bind_param(stmt, 3, day_of_week)

        # Execute the statement
        ibm_db.execute(stmt)

        # Fetch the first row
        row = ibm_db.fetch_assoc(stmt)

        if not row:
            return Response(f"Doctor with email {email} has no schedule for the date {myDate}.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        return Response(json.dumps(row, default=str), status=HTTPStatus.OK, mimetype='application/json')

    except Exception as e:
        raise e
    finally: # Always free the statements
        ibm_db.free_stmt(stmt)
        drop_schedule_functions()

@doctor_controller.route('/doctor/top/<int:month>/<int:year>', methods=['GET'])
def find_top_performers(month, year):
    
    try:
    
        # Write the query
        sql = '''
        WITH avg_num_appts_per_doctor(specialization, doctor_email, num_appointments_for_month, avg_rating) AS
                (SELECT specialization, d.email, COUNT(appointment_id), AVG(doctor_rating)
                FROM doctors d
                        LEFT OUTER JOIN (SELECT *
                                            FROM appointments a
                                            WHERE MONTH(a.date) = ?
                                            AND YEAR(a.date) = ?) a
                                        ON d.email = a.doctor_email
                GROUP BY d.email, d.specialization),
            doctors_above_average_num_appointments_and_average_rating_above_4(specialization, doctor_email, num_appointments_for_month, avg_rating)
                AS
                (SELECT specialization, doctor_email, num_appointments_for_month, avg_rating
                FROM avg_num_appts_per_doctor
                WHERE num_appointments_for_month >= (SELECT AVG(num_appointments_for_month) FROM avg_num_appts_per_doctor)
                    AND avg_rating >= 4), -- At this point, we have doctors with above average number of appointments for the month, as well as rating >= 4;
            doctors_favorited_at_least_3(specialization, doctor_email, num_appointments_for_month, avg_rating, num_favorites)
                AS
                (SELECT specialization, d.doctor_email, num_appointments_for_month, avg_rating, COUNT(patient_email)
                FROM doctors_above_average_num_appointments_and_average_rating_above_4 d,
                    favorites f
                WHERE d.doctor_email = f.doctor_email
                GROUP BY d.specialization, d.doctor_email, d.num_appointments_for_month, d.avg_rating
                HAVING COUNT(patient_email) >= 3),
            num_refs_per_doctor(specialization, doctor_email, num_refs) AS
                (SELECT d.specialization, d.email, COUNT(appointment_id)
                FROM doctors d
                        LEFT OUTER JOIN referrals r ON d.email = r.doctor_email
                GROUP BY d.email, d.specialization),
            average_num_refs_per_specialization(specialization, avg_refs) AS
                (SELECT specialization, AVG(num_refs)
                FROM num_refs_per_doctor
                GROUP BY specialization)
        SELECT d.specialization, d.doctor_email, d.num_appointments_for_month, d.avg_rating, d.num_favorites, n.num_refs
        FROM doctors_favorited_at_least_3 d,
            num_refs_per_doctor n
        WHERE d.doctor_email = n.doctor_email
        AND n.num_refs >= (SELECT avg_refs FROM average_num_refs_per_specialization WHERE specialization = d.specialization);
        '''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        #  Bind the parameters
        ibm_db.bind_param(stmt, 1, month)
        ibm_db.bind_param(stmt, 2, year)

        # Execute the statement
        ibm_db.execute(stmt)

        # Fetch all elements of the result
        all_top_performers = []
        result = ibm_db.fetch_assoc(stmt)
        while(result != False):
            all_top_performers.append(result)
            result = ibm_db.fetch_assoc(stmt)

        # Return the result if it was found
        if len(all_top_performers) == 0:
            return Response(f"No top performers found for the month", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        return Response(json.dumps(all_top_performers, default=str), status=HTTPStatus.OK, mimetype='application/json')

    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')

    finally:
        # Free the statement 
        ibm_db.free_stmt(stmt)

@doctor_controller.route('/doctor/referrals/<string:doctor_email>', methods=['GET'])
def get_referrals(doctor_email):
    try:
        # Write the query
        sql = '''SELECT 
                    a.date AS referral_date,
                    a.doctor_email AS referring_doctor,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.preferred_language
                 FROM 
                    users u,
                    chatbotconversations c,
                    appointments a,
                    referrals r
                 WHERE 
                    u.email = c.patient_email AND
                    a.conversation_id = c.conversation_id AND
                    r.appointment_id = a.appointment_id AND
                    r.doctor_email = ?
                 ORDER BY a.date'''
        
        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # Bind the parameter 
        ibm_db.bind_param(stmt, 1, doctor_email)

        # Execute the statement
        ibm_db.execute(stmt)

        # Initialize an empty list to hold all the result rows
        results = []

        # Fetch the result
        result = ibm_db.fetch_assoc(stmt)
        while result:
            results.append(result)
            result = ibm_db.fetch_assoc(stmt)

        # Check if the result was found
        if len(results) == 0:
            return Response(f"No referrals found for doctor with email {doctor_email}.", status=HTTPStatus.NOT_FOUND, mimetype='application/json')

        # Return the results
        return Response(json.dumps(results, default=str), status=HTTPStatus.OK, mimetype='application/json')
    
    except Exception as e:
        return Response(f"An error occurred while accessing the database: {e}", status=HTTPStatus.INTERNAL_SERVER_ERROR, mimetype='application/json')
    
    finally: # Always free the statement
        ibm_db.free_stmt(stmt)

#
# HELPER FUNCTIONS
#
        
def fetch_doctor(email):
    try:
        # Write the query
        sql = '''SELECT * FROM doctors WHERE email = ?'''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        # Bind the parameters
        ibm_db.bind_param(stmt, 1, email)

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

def create_schedule_functions():
    try:
        # Write the query
        sql1 = '''
        CREATE FUNCTION get_day_of_week_index(dayofweek VARCHAR(20))
            RETURNS INTEGER
        BEGIN
            DECLARE index INTEGER;

            CASE dayofweek
                WHEN 'Monday' THEN SET index = 2;
                WHEN 'Tuesday' THEN SET index = 3;
                WHEN 'Wednesday' THEN SET index = 4;
                WHEN 'Thursday' THEN SET index = 5;
                WHEN 'Friday' THEN SET index = 6;
                WHEN 'Saturday' THEN SET index = 7;
                WHEN 'Sunday' THEN SET index = 1; -- Sunday is 1 to match the built-in DAYOFWEEK function
                END CASE;

            RETURN index;
        END
        '''

        sql2 = '''
        CREATE FUNCTION get_day_of_week_name(dayofweekindex Integer)
            RETURNS VARCHAR(20)
        BEGIN
            DECLARE day VARCHAR(20);

            CASE dayofweekindex
                WHEN 2 THEN SET day = 'Monday';
                WHEN 3 THEN SET day = 'Tuesday';
                WHEN 4 THEN SET day = 'Wednesday';
                WHEN 5 THEN SET day = 'Thursday';
                WHEN 6 THEN SET day = 'Friday';
                WHEN 7 THEN SET day = 'Saturday';
                WHEN 1 THEN SET day = 'Sunday';
                END CASE;

            RETURN day;
        END
        '''
        # Prepare the statements
        stmt1 = ibm_db.prepare(conn, sql1)
        stmt2 = ibm_db.prepare(conn, sql2)
        
        # Execute the statement
        ibm_db.execute(stmt1)
        ibm_db.execute(stmt2)

    except Exception as e:
        raise e
    finally: # Always free the statement
        ibm_db.free_stmt(stmt1)
        ibm_db.free_stmt(stmt2)


def drop_schedule_functions():
    try:
        # Write the query
        sql1 = '''
        DROP FUNCTION get_day_of_week_index;
        '''
        sql2 = '''
        DROP FUNCTION get_day_of_week_name;
        '''
        # Prepare the statements
        stmt1 = ibm_db.prepare(conn, sql1)
        stmt2 = ibm_db.prepare(conn, sql2)
        # Execute the statements
        ibm_db.execute(stmt1)
        ibm_db.execute(stmt2)

    except Exception as e:
        raise e
    finally: # Always free the statements
        ibm_db.free_stmt(stmt1)
        ibm_db.free_stmt(stmt2)  
