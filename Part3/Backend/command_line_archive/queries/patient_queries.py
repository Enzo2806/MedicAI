import ibm_db

def retrieve_patient_information(conn, patient_email):

    try:
    
        # Write the query
        sql = '''SELECT * FROM patients WHERE email = ?'''

        # Prepare the statement
        stmt = ibm_db.prepare(conn, sql)

        #  Bind the parameters
        ibm_db.bind_param(stmt, 1, patient_email)

        # Execute the statement
        ibm_db.execute(stmt)

        # Fetch the result
        result = ibm_db.fetch_assoc(stmt)

        # Print the result if it was found
        if result == False:
            print(f"\nPatient with email {patient_email} was not found.")
        else:
            print("\nPatient information: ")
            print(
                f"Email: {result['EMAIL']}, "
                + f"Credit card number: {result['CREDIT_CARD_NUMBER']}, "
                + f"Credit card expiry date: {result['CREDIT_CARD_EXPIRY_DATE']}, "
                + f"Health insurance number: {result['HEALTH_INSURANCE_NUMBER']}"
            )

    except Exception as e:
        print(f"An error occurred: {e}")
    
    finally: # Always free the statement
        ibm_db.free_stmt(stmt)