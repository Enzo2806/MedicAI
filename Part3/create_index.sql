-- LEAVE this statement on. It is required to connect to your database.
CONNECT TO comp421;

-- Create a non-clustered index on Patient(healthInsuranceNumber)
CREATE INDEX idx_patient_healthInsuranceNumber ON Patients(health_insurance_number);

-- Create a clustered index on DayShedule(doctorEmail)
CREATE INDEX idx_dayschedule_doctorEmail ON DaySchedules(doctor_email) CLUSTER;
