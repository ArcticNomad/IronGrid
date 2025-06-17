CREATE DATABASE ironGrid;
USE ironGrid;

select 
-- User table
delete from user TABLE user (
    user_id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    password_hash VARCHAR(20) NOT NULL,
    email VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(10) NOT NULL,
    last_name VARCHAR(10) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male','Female','Other','Prefer not to say'),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    account_type ENUM('trainer','member') NOT NULL
);

select * from member
CREATE TABLE member (
    member_id VARCHAR(10) PRIMARY KEY,
    user_id VARCHAR(10),
    height DECIMAL(5,2) COMMENT 'in cm',
    current_weight DECIMAL(5,2) COMMENT 'in kg',
    target_weight DECIMAL(5,2),
    fitness_level TINYINT CHECK (fitness_level BETWEEN 1 AND 10),
    primary_goal ENUM('weight_loss','muscle_gain','endurance','maintenance'),
    medical_conditions VARCHAR(255) ,
    dietary_preferences VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);
ALTER TABLE member
ADD COLUMN member_plan ENUM('Basic', 'Powerpro') DEFAULT 'Basic';

ALTER TABLE member MODIFY member_plan VARCHAR(255) DEFAULT NULL;
CREATE TABLE trainer (
    trainer_id VARCHAR(10) PRIMARY KEY,
    user_id VARCHAR(10),
    certification VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    years_experience INT,
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE exercise_library (
    exercise_id VARCHAR(10) PRIMARY KEY,
    trainer_id VARCHAR(10) NOT NULL,
    ex_name VARCHAR(100) NOT NULL,
    category ENUM('cardio','strength','flexibility','balance'),
    equipment_needed VARCHAR(50),
    difficulty ENUM('beginner','intermediate','advanced'),
    video_url VARCHAR(255),
    calories_burned_per_min DECIMAL(5,2),
    instructions VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id)
);

CREATE TABLE workout_plan (
  workout_plan_id VARCHAR(10) PRIMARY KEY,
  trainer_id VARCHAR(10) NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  duration_weeks INT NOT NULL,
  duration_session INT NOT NULL COMMENT 'in minutes',
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  status ENUM('draft', 'active', 'completed', 'archived') NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id)
);

CREATE TABLE plan_exercises (
  plan_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_plan_id VARCHAR(10) NOT NULL,
  exercise_id VARCHAR(10) NOT NULL,
  sets INT NOT NULL,
  reps INT NOT NULL,
  day_num INT NOT NULL COMMENT 'Day of the week (1-7)',
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(exercise_id) ON DELETE CASCADE
);
drop table workout_plan
CREATE TABLE diet_plan (
    diet_plan_id VARCHAR(10) PRIMARY KEY,
    trainer_id VARCHAR(10) NOT NULL,
    member_id VARCHAR(10),
    plan_name VARCHAR(100) NOT NULL,
    daily_calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    dietary_restrictions VARCHAR(255),
    cuisine_preferences VARCHAR(255),
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft','active','completed','archived'),
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id),
    FOREIGN KEY (member_id) REFERENCES member(member_id)
);
ALTER TABLE workout_plan 
MODIFY COLUMN plan_name VARCHAR(100) NOT NULL;
select * from diet_plan

CREATE TABLE meal_library (
    meal_id VARCHAR(10) PRIMARY KEY,
    trainer_id VARCHAR(10) NOT NULL,
    meal_name VARCHAR(50) NOT NULL,
    meal_type ENUM('breakfast','lunch','dinner','snack'),
    preparation_time INT COMMENT 'in minutes',
    recipe_url VARCHAR(255),
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id)
);
drop table meal_library
drop table meal_nutrition
CREATE TABLE meal_nutrition (
    meal_id VARCHAR(10) PRIMARY KEY,
    serving_size VARCHAR(10) NOT NULL COMMENT 'e.g., "1 cup", "200g"',
    calories INT NOT NULL,
    protein DECIMAL(5,2) COMMENT 'in grams',
    carbs DECIMAL(5,2) COMMENT 'in grams',
    fat DECIMAL(5,2) COMMENT 'in grams',
    fiber DECIMAL(5,2) COMMENT 'in grams',
    FOREIGN KEY (meal_id) REFERENCES meal_library(meal_id)
);

CREATE TABLE plan_meals (
    diet_plan_id VARCHAR(10),
    meal_id VARCHAR(10),
    day_num TINYINT NOT NULL CHECK (day_num BETWEEN 1 AND 7),
    PRIMARY KEY (diet_plan_id, meal_id, day_num),
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plan(diet_plan_id),
    FOREIGN KEY (meal_id) REFERENCES meal_library(meal_id)
);





CREATE TABLE member_workout_plans (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(10) NOT NULL,
    workout_plan_id VARCHAR(10) NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id)
);
CREATE TABLE member_diet_plans (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(10) NOT NULL,
    diet_plan_id VARCHAR(10) NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plan(diet_plan_id)
);

CREATE TABLE progress_entry (
    entry_id VARCHAR(10) PRIMARY KEY,
    member_id VARCHAR(10) NOT NULL,
    entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    weight DECIMAL(5,2) COMMENT 'in kg',
    body_fat_percentage DECIMAL(5,2),
    muscle_mass DECIMAL(5,2) COMMENT 'in kg',
    measurements JSON COMMENT 'JSON of body measurements',
    photos JSON COMMENT 'JSON array of photo URLs',
    notes VARCHAR(255),
    FOREIGN KEY (member_id) REFERENCES member(member_id)
);

SELECT * FROM progress_entry

CREATE TABLE workout_session (
    session_id VARCHAR(10) PRIMARY KEY,
    member_id VARCHAR(10) NOT NULL,
    workout_plan_id VARCHAR(10),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    total_calories INT,
    session_rating TINYINT CHECK (session_rating BETWEEN 1 AND 10),
    completed_percentage TINYINT CHECK (completed_percentage BETWEEN 0 AND 100),
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(workout_plan_id)
);
-- Session Exercise Details
CREATE TABLE session_details (
    session_id VARCHAR(10),
    exercise_id VARCHAR(10),
    actual_sets INT NOT NULL,
    actual_reps INT NOT NULL,
    weight_used DECIMAL(5,2) COMMENT 'in kg',
    notes VARCHAR(255),
    PRIMARY KEY (session_id, exercise_id),
    FOREIGN KEY (session_id) REFERENCES workout_session(session_id),
    FOREIGN KEY (exercise_id) REFERENCES exercise_library(exercise_id)
	);
    
    ALTER TABLE workout_session MODIFY COLUMN session_id VARCHAR(15);






DELIMITER //
CREATE PROCEDURE GetMemberDashboardData(IN p_user_id VARCHAR(10))
BEGIN
    -- Get only the most recent member record for this user
    SELECT 
        m.member_id,
        m.current_weight,
        m.target_weight,
        m.fitness_level,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        COALESCE(
            (SELECT wp.plan_name 
             FROM workout_plan wp
             JOIN member_workout_plans mwp ON wp.workout_plan_id = mwp.workout_plan_id
             WHERE mwp.member_id = m.member_id AND wp.status = 'active'
             ORDER BY mwp.assigned_date DESC 
             LIMIT 1),
            'Not assigned'
        ) AS active_workout_plan,
        COALESCE(
            (SELECT dp.plan_name 
             FROM diet_plan dp
             JOIN member_diet_plans mdp ON dp.diet_plan_id = mdp.diet_plan_id
             WHERE mdp.member_id = m.member_id AND dp.status = 'active'
             ORDER BY mdp.assigned_date DESC 
             LIMIT 1),
            'Not assigned'
        ) AS active_diet_plan
    FROM member m
    JOIN user u ON m.user_id = u.user_id
    WHERE m.user_id = p_user_id
    ORDER BY m.member_id DESC  -- Get most recent member record
    LIMIT 1;                   -- Only return one row
END //
DELIMITER ;





-- Test the stored procedure directly in MySQL
CALL GetMemberDashboardData('U179');

select * from workout_session

DROP PROCEDURE IF EXISTS GetMemberDashboardData;
SELECT * FROM member_workout_plans
SELECT * FROM plan_exercises
SELECT * FROM workout_plan
SELECT * FROM diet_plan
SELECT * FROM meal_nutrition
SELECT * FROM  exercise_library
select * from user
select * from member 
select * from trainer
DROP table member


SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE session_details;
TRUNCATE TABLE workout_session;
TRUNCATE TABLE progress_entry;
TRUNCATE TABLE member_diet_plans;
TRUNCATE TABLE member_workout_plans;
TRUNCATE TABLE plan_meals;
TRUNCATE TABLE meal_nutrition;
TRUNCATE TABLE meal_library;
TRUNCATE TABLE diet_plan;
TRUNCATE TABLE plan_exercises;
TRUNCATE TABLE workout_plan;
TRUNCATE TABLE exercise_library;
TRUNCATE TABLE trainer;
TRUNCATE TABLE member;
TRUNCATE TABLE user;

SET FOREIGN_KEY_CHECKS = 1;
