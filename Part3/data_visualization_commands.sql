-- Query 1
DROP PROCEDURE add_referred_doctors_as_favorites;


CREATE TABLE average_price_per_specialization (
                                                 specialization VARCHAR(100),
                                                 average_price DECIMAL(5,2)
);
INSERT INTO average_price_per_specialization(specialization, average_price)
SELECT
   specialization,
   AVG(price_per_hour) AS average_price
FROM
   doctors
GROUP BY
   specialization;


EXPORT TO COMP421PLOT1.csv OF DEL MODIFIED BY NOCHARDEL 
SELECT * FROM average_price_per_specialization;

-- Query 2
CREATE TABLE language_dist(user_type VARCHAR(10),
                          english_count INT,
                          french_count INT);




INSERT INTO language_dist (user_type, english_count, french_count)
SELECT 'Doctor' AS user_type,
      COUNT(NULLIF(preferred_language, 'French')) AS english_count,
      COUNT(NULLIF(preferred_language, 'English')) AS french_count
FROM users WHERE email IN (SELECT email FROM doctors);


INSERT INTO language_dist (user_type, english_count, french_count)
SELECT 'Patient' AS user_type,
      COUNT(NULLIF(preferred_language, 'French')) AS english_count,
      COUNT(NULLIF(preferred_language, 'English')) AS french_count
FROM users WHERE email IN (SELECT email FROM patients);


db2 => EXPORT TO COMP421PLOT2.csv OF DEL MODIFIED BY NOCHARDEL 
SELECT * FROM language_dist;