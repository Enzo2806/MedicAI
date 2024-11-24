-- CONNECT TO comp421;

-- Add a patient's referred doctors as favorites

-- Create the procedure
CREATE PROCEDURE add_referred_doctors_as_favorites(IN patient_email VARCHAR(255))
    LANGUAGE SQL
p1:
BEGIN

    -- Declare variables
    DECLARE done1 BOOLEAN DEFAULT FALSE;
    DECLARE c1_doctor_email VARCHAR(255);
    DECLARE c1_patient_email VARCHAR(255);
    DECLARE doctor_in_favorites BOOLEAN;

    -- Cursor 1: Retrieve all doctors in their referrals
    DECLARE c1 CURSOR FOR
        SELECT DISTINCT r.doctor_email, patient_email
        FROM referrals r,
             appointments a,
             chatbotconversations c
        WHERE r.appointment_id = a.appointment_id
          AND a.conversation_id = c.conversation_id
          AND c.patient_email = patient_email;

    -- Declare a handler for the end of the cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done1 = TRUE;

    -- Loop over the first cursor
    OPEN c1;

    -- Fetch the next row
    FETCH c1 INTO c1_doctor_email, c1_patient_email;

    WHILE NOT done1
        DO

            -- Set the doctor_in_favorites variable to false
            SET doctor_in_favorites = FALSE;

            -- Declare an inner block to handle the second cursor
            p2:
            BEGIN

                -- Declare variables
                DECLARE done2 BOOLEAN DEFAULT FALSE;
                DECLARE c2_doctor_email VARCHAR(255);
                DECLARE c2_patient_email VARCHAR(255);

                -- Cursor 2: Check if the doctor is already in the favorites
                DECLARE c2 CURSOR FOR
                    SELECT *
                    FROM favorites
                    WHERE doctor_email = c1_doctor_email
                      AND patient_email = c1_patient_email;

                -- Declare a handler for the end of the cursor
                DECLARE CONTINUE HANDLER FOR NOT FOUND SET done2 = TRUE;

                -- Open the second cursor
                OPEN c2;

                -- Fetch the next row
                FETCH c2 INTO c2_doctor_email, c2_patient_email;

                WHILE NOT done2
                    DO

                        -- Close the cursor if the doctor is already in the favorites
                        IF c2_doctor_email = c1_doctor_email THEN
                            SET doctor_in_favorites = TRUE;
                            SET done2 = TRUE;
                        END IF;

                        -- Fetch the next row
                        FETCH c2 INTO c2_doctor_email, c2_patient_email;

                    END WHILE;
                CLOSE c2; -- Close the second cursor after every inner loop
            END p2;

            -- Insert the doctor into the favorites if they are not already there
            IF NOT doctor_in_favorites THEN
                INSERT INTO favorites
                VALUES (c1_doctor_email, c1_patient_email);
            END IF;

            -- Fetch the next row
            FETCH c1 INTO c1_doctor_email, c1_patient_email;

        END WHILE;

    -- Close the outer loop's cursor
    CLOSE c1;

END p1;

-- Visualize chloe's referrals before calling the procedure
SELECT DISTINCT r.doctor_email, patient_email
FROM referrals r,
     appointments a,
     chatbotconversations c
WHERE r.appointment_id = a.appointment_id
  AND a.conversation_id = c.conversation_id
  AND c.patient_email = 'chloe.dillon@mail.mcgill.ca';

-- Visualize chloe's favorites before calling the procedure
SELECT *
FROM favorites
WHERE patient_email = 'chloe.dillon@mail.mcgill.ca';

-- Call the procedure
CALL add_referred_doctors_as_favorites('chloe.dillon@mail.mcgill.ca');

-- Visualize chloe's favorites after calling the procedure
SELECT *
FROM favorites
WHERE patient_email = 'chloe.dillon@mail.mcgill.ca';

-- Drop the procedure
DROP PROCEDURE add_referred_doctors_as_favorites;