const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./db");
const { error } = require("console");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  "/assets",
  express.static(path.join(__dirname, "iron-grid", "dist", "assets"))
);
app.use(express.static(path.join(__dirname, "iron-grid", "dist")));

// app.get('/test-db', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT 1 + 1 AS solution');
//     res.json({ success: true, message: 'Database connected', solution: rows[0].solution });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Database connection failed', error: err.message });
//   }
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "iron-grid", "dist", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "iron-grid", "dist", "index.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "iron-grid", "dist", "index.html"));
});

app.get("/MemberRegistration", (req, res) => {
  res.sendFile(path.join(__dirname, "iron-grid", "dist", "index.html"));
});

app.get('/MemberDash', (req,res)=>{
  res.sendFile(path.join(__dirname, "iron-grid", "dist", "index.html"));
})
app.get('/TrainerDash', (req,res)=>{
  res.sendFile(path.join(__dirname, "iron-grid", "dist", "index.html"));
})

app.get('/profile', async (req, res) => {
  const user_id = req.query.user_id;
  
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Base user information
    const [userRows] = await pool.query(
      `SELECT 
        user_id, 
        username, 
        email, 
        first_name,
        last_name,
        account_type,
        gender,
        registration_date
      FROM user 
      WHERE user_id = ?`,
      [user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userRows[0];
    const responseData = { ...userData };

    // Add trainer-specific data if account is trainer
    if (userData.account_type === 'trainer') {
      const [trainerRows] = await pool.query(
        `SELECT 
          specialization,
          certification,
          years_experience ,
          hourly_rate
        FROM trainer
        WHERE user_id = ?`,
        [user_id]
      );
      
      if (trainerRows.length > 0) {
        responseData.trainer_info = trainerRows[0];
      }
    }
    // Add member-specific data if account is member
    else if (userData.account_type === 'member') {
      const [memberRows] = await pool.query(
        `SELECT 
          height,
          current_weight,
          target_weight,
          fitness_level ,
          primary_goal,
          medical_conditions ,
          dietary_preferences 
        FROM member
        WHERE user_id = ?`,
        [user_id]
      );
      
      if (memberRows.length > 0) {
        responseData.member_info = memberRows[0];
      }

      // Get active plans for members
      const [planRows] = await pool.query(
        `SELECT 
          plan_id,
          plan_name,
          start_date,
          end_date,
          status
        FROM member_plans 
        WHERE user_id = ? AND status = 'active'`,
        [user_id]
      );
      
      responseData.active_plans = planRows;
    }

    res.json(responseData);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});




app.post("/register", async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    email,
    password,
    gender,
    account_type,
    date_of_birth,
  } = req.body;

  try {
    // check if user already exists
    const [existing] = await pool.query(
      "SELECT user_id FROM user WHERE user_id=? OR email=?",
      [username, email]
    );

    if (existing.length > 0) {
      console.log("user exists already");
      return res.status(401).json({
        success: false,
        error: "USER_EXISTS", // Error code
        message: "User Already Exists",
      });
    }

    // check if username already exists

    const [existingMember] = await pool.query(
      `SELECT username FROM user WHERE username=?`,
      [username]
    );

    if (existingMember.length > 0) {
      console.log("username taken");
      return res.status(402).json({
        success: false,
        error: "Username_Taken", // Error code
        message: "Username Is Taken",
      });
    }
    // generate random userID
    const randNum = Math.floor(Math.random() * (200 - 10) + 10);
    const user_id = `U${randNum}`;

    console.log(`generated User id : ${user_id}`);

    const formattedRegistrationDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const formattedBirthDate = date_of_birth || null; // Handle NULL if not provided

    const [result] = await pool.query(
      `INSERT INTO user
       (user_id,username,password_hash,email,first_name,last_name,date_of_birth,gender, registration_date,account_type) 
       VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        user_id,
        username,
        password,
        email,
        firstName,
        lastName,
        formattedBirthDate,
        gender,
        formattedRegistrationDate,
        account_type,
      ]
    );
    console.log(
      user_id,
      username,
      password,
      email,
      firstName,
      lastName,
      formattedBirthDate,
      gender,
      formattedRegistrationDate,
      account_type
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: result.insertId,
        username,
        email,
        account_type,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
      details: error.message,
    });
  }
});

app.post("/MemberRegistration", async (req, res) => {
  console.log("Received:", req.body);
  const {
    username,
    height,
    current_weight,
    target_weight,
    fitness_level,
    primary_goal,
    medical_conditions,
    dietary_preferences,
  } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT user_id FROM user WHERE username=?`,
      [username]
    );
    if (rows.length === 0) throw new Error("No user found");

    const userId = rows[0].user_id;
    console.log(`user ID is ${userId}`);

    const randNum = Math.floor(Math.random() * (200 - 10) + 10);
    const member_id = `M${randNum}`;

    console.log(`generated Member id : ${member_id}`);

    const [result] = await pool.query(
      `INSERT INTO member 
    (member_id,user_id,height,current_weight,target_weight,fitness_level,primary_goal,medical_conditions,dietary_preferences)
    VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        member_id,
        userId,
        height,
        current_weight,
        target_weight,
        fitness_level,
        primary_goal,
        medical_conditions,
        dietary_preferences,
      ]
    );
    console.log(result);
    res.status(200).json({
      success: true,
      message: "Member Registered Succesfully",
      member: {
        result,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Registration failed",
      details: error.message,
    });
  }
});

app.get("/TrainerRegistration", (req, res) => {
  res.sendFile(path.join(__dirname, "iron-grid", "dist", "index.html"));
});

app.post("/TrainerRegistration", async (req, res) => {
  const {
    username,
    certification,
    specialization,
    years_experience,
    hourly_rate,
    bio,
    is_admin,
  } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT user_id FROM user WHERE username=?`,
      [username]
    );
    if (rows.length === 0) throw new Error("No user found");

    const userId = rows[0].user_id;
    console.log(`user ID is ${userId}`);

    const randNum = Math.floor(Math.random() * (200 - 10) + 10);
    const trainer_id = `T${randNum}`;

    console.log(`generated Trainer id : ${trainer_id}`);

    const [result] = await pool.query(
      `INSERT INTO trainer 
    (trainer_id,user_id,certification,specialization,years_experience,hourly_rate,bio,is_admin) VALUES(?,?,?,?,?,?,?,?)`,
      [
        trainer_id,
        userId,
        certification,
        specialization,
        years_experience,
        hourly_rate,
        bio,
        is_admin,
      ]
    );

    console.log(result);

    res.status(200).json({
      success: true,
      message: "Trainer Registered Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Registration failed",
      details: error.message,
    });
  }
});app.delete('/exercises/:exerciseId', async (req, res) => {
  const { exerciseId } = req.params;
  context = req.body?.context || 'DIRECT_DELETE'; // Get context from request body
  
  try {
    // Verify exercise exists
    const [exerciseExists] = await pool.query(
      `SELECT exercise_id FROM exercise_library WHERE exercise_id = ?`,
      [exerciseId]
    );

    if (exerciseExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found in database'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Always remove from plan_exercises first
      await connection.query(
        `DELETE FROM plan_exercises WHERE exercise_id = ?`,
        [exerciseId]
      );

      // Only delete from exercise_library if not PLAN_DELETE
      if (context !== 'PLAN_DELETE') {
        const [result] = await connection.query(
          `DELETE FROM exercise_library WHERE exercise_id = ?`,
          [exerciseId]
        );

        if (result.affectedRows === 0) {
          throw new Error('Exercise not found');
        }
      }

      await connection.commit();
      
      res.json({ 
        success: true,
        message: context === 'PLAN_DELETE' 
          ? 'Exercise removed from plans' 
          : 'Exercise completely deleted' 
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete exercise',
      details: err.message
    });
  }
});

app.post('/exercises',async (req,res)=>{
  const {user_id,name,category,equipment,difficulty,calories,instructions,video_url}=req.body;

  console.log(name);
  
  try{

    console.log('starting')

    const randNum = Math.floor(Math.random() * (200 - 10) + 10);
      const exercise_id = `EX${randNum}`;

    console.log(`generated Exercise id : ${exercise_id}`);


    // get trainer id

    const [trainers] =await pool.query(`SELECT trainer_id FROM trainer WHERE user_id=? `,[user_id])

      if (trainers.length === 0) {
      return res.status(402).json({ success: false, error: 'Trainer not found for user_id' });
    }


    const trainer_id=trainers[0].trainer_id;

    console.log('trainer id ',trainer_id)

    const [result] = await pool.query(
  `INSERT INTO exercise_library 
   (exercise_id, trainer_id, ex_name, category, equipment_needed, difficulty, calories_burned_per_min, instructions,video_url) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? )`,
  [exercise_id, trainer_id, name, category, equipment, difficulty, calories, instructions,video_url]
);
    console.log(result)

      res.status(200).json({
        success:true,
        message: 'Added Succesfully !',
      })

    }catch(error){
      console.log(error)
      res.status(500).json({
        success: false,
      error: 'Exercise addition failed',
      message: error.message
      })
    }

})

app.get('/getExercises',async(req,res)=>{
  try{
    const [data]= await pool.query(`SELECT * FROM exercise_library`)
    res.status(200).json({
      success:true,
      data 
    })
  }catch(err){
    console.log(err)
    res.status(500).json({
      success:false,
      error:'Failed to Get Exercises',
      message: error.details
    })
  }
})

app.post('/meals',async(req,res)=>{
  const {user_id,m_name,type,preparationTime,isVegetarian,isVegan,isGlutenFree,servingSize,calories,protein,carbs,fat,fiber,recipeUrl}=req.body

  try {
    const randNum = Math.floor(Math.random() * (200 - 10) + 10);
    const meal_id = `ML${randNum}`;

    console.log(`generated Meal id : ${meal_id}`);

    // get trainer id

    const [trainers] = await pool.query(
      `SELECT trainer_id FROM trainer WHERE user_id=? `,
      [user_id]
    );

    if (trainers.length === 0) {
      return res
        .status(402)
        .json({ success: false, error: "Trainer not found for user_id" });
    }

    const trainer_id = trainers[0].trainer_id;

    console.log("trainer id ", trainer_id);

    const [result_1] = await pool.query(
      `INSERT INTO meal_library
      (trainer_id,meal_id,meal_name,meal_type,preparation_time,is_vegetarian,is_vegan,is_gluten_free,recipe_url)
      VALUES(?,?,?,?,?,?,?,?,?)`,
      [
        trainer_id,
        meal_id,
        m_name,
        type,
        preparationTime,
        isVegetarian,
        isVegan,
        isGlutenFree,
        recipeUrl,
      ]
    );

    console.log(result_1);


    const[result_2]=await pool.query(`INSERT INTO meal_nutrition 
      (meal_id,serving_size,calories,protein,carbs,fat,fiber)
      VALUES(?,?,?,?,?,?,?)`,[meal_id,servingSize,calories,protein,carbs,fat,fiber])

      console.log(result_2)

    res.status(200).json({
      success: true,
      message: "Meal Added Successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Failed to Add Meal",
      message: error.details,
    });
  }

})

app.get('/getMeals',async(req,res)=>{
   try{
    const [data]= await pool.query(` SELECT 
        meal_library.meal_id,
        meal_library.trainer_id,
        meal_library.meal_name,
        meal_library.meal_type,
        meal_library.preparation_time,
        meal_library.is_vegetarian,
        meal_library.is_vegan,
        meal_library.is_gluten_free,
        meal_library.recipe_url,
        meal_nutrition.serving_size,
        meal_nutrition.calories,
        meal_nutrition.protein,
        meal_nutrition.carbs,
        meal_nutrition.fat,
        meal_nutrition.fiber
      FROM meal_library
      JOIN meal_nutrition ON meal_library.meal_id = meal_nutrition.meal_id `)
    res.status(200).json({
      success:true,
       data: data || []   
    })
  }catch(err){
    console.log(err)
    res.status(500).json({
      success:false,
      error:'Failed to Get Meals',
      message: error.details
    })
  }
})


app.delete('/meals/:mealID', async (req, res) => {
  const { mealID } = req.params;
  
  // Safely get context with default value
  const context = req.body?.context || 'DIRECT_DELETE'; 
  
  try {
    // Verify meal exists
    const [mealExists] = await pool.query(
      `SELECT meal_id FROM meal_library WHERE meal_id = ?`,
      [mealID]
    );

    if (mealExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found in database',
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove from plan_meals first (to avoid FK constraints)
      await connection.query(
        `DELETE FROM plan_meals WHERE meal_id = ?`,
        [mealID]
      );

      // Only delete from other tables if not PLAN_DELETE
      if (context !== 'PLAN_DELETE') {
        await connection.query(
          `DELETE FROM meal_nutrition WHERE meal_id = ?`,
          [mealID]
        );

        const [result] = await connection.query(
          `DELETE FROM meal_library WHERE meal_id = ?`,
          [mealID]
        );

        if (result.affectedRows === 0) {
          throw new Error('Meal not found');
        }
      }

      await connection.commit();
      
      return res.json({ 
        success: true, 
        message: context === 'PLAN_DELETE' 
          ? 'Meal removed from plans' 
          : 'Meal completely deleted' 
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete meal',
      details: err.message 
    });
  }
});

app.get('/getPlanMeals', async (req, res) => {
  const { plan_id } = req.query;
  
  try {
    const [meals] = await pool.query(`
      SELECT 
        m.meal_id,
        m.meal_name,
        m.meal_type,
        m.preparation_time,
        m.recipe_url,
        m.is_vegetarian,
        m.is_vegan,
        m.is_gluten_free,
        mn.serving_size,
        mn.calories,
        mn.protein,
        mn.carbs,
        mn.fat,
        mn.fiber,
        pm.day_num
      FROM plan_meals pm
      JOIN meal_library m ON pm.meal_id = m.meal_id
      JOIN meal_nutrition mn ON m.meal_id = mn.meal_id
      WHERE pm.diet_plan_id = ?
      ORDER BY pm.day_num, m.meal_type
    `, [plan_id]);

    res.json({
      success: true,
      data: meals.map(meal => ({
        meal_id: meal.meal_id,
        m_name: meal.meal_name,
        type: meal.meal_type,
        preparationTime: meal.preparation_time,
        recipeUrl: meal.recipe_url,
        isVegetarian: Boolean(meal.is_vegetarian),
        isVegan: Boolean(meal.is_vegan),
        isGlutenFree: Boolean(meal.is_gluten_free),
        servingSize: meal.serving_size,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        day_num: meal.day_num
      }))
    });
  } catch (err) {
    console.error('Error fetching plan meals:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: err.message 
    });
  }
});
app.post('/mealPlan',async(req,res)=>{
  const{user_id,plan_name,daily_calories,protein_grams,carbs_grams,fat_grams,dietary_restrictions,cuisine_preferences,status}=req.body

  try{
    const randNum = Math.floor(Math.random() * (200 - 10) + 10);
      const diet_plan_id = `DP${randNum}`;


    console.log(`generated diet plan id : ${diet_plan_id}`);

    
    const [trainers] =await pool.query(`SELECT trainer_id FROM trainer WHERE user_id=? `,[user_id])

      if (trainers.length === 0) {
      return res.status(402).json({ success: false, error: 'Trainer not found for user_id' });
    }


    const trainer_id=trainers[0].trainer_id;

    console.log('trainer id ',trainer_id)


    const [result]=await pool.query(`INSERT INTO diet_plan 
      (trainer_id,diet_plan_id,plan_name,daily_calories,protein_grams,carbs_grams,fat_grams,dietary_restrictions,cuisine_preferences,status)
      VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [trainer_id,diet_plan_id,plan_name,daily_calories,protein_grams,carbs_grams,fat_grams,dietary_restrictions,cuisine_preferences,status]
    )
    console.log(result)
    
    res.status(200).json({
      success:true,
      message:'Data Successfully Added !'
    })
  }catch(err){
     console.log("Error inserting meal plan:", err);
    res.status(500).json({
      success:false,
      error:"Data Submission Failed "
    })
  }

}

)

app.delete('/deleteDietPlans/:planId', async (req, res) => {
  const { planId } = req.params;
  
  // Get a connection from the pool
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
        const [planExists] = await connection.query(
      `SELECT diet_plan_id FROM diet_plan WHERE diet_plan_id = ?`,
      [planId]
    );
     if (planExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Diet plan not found'
      });
    }

    // 1. First delete all associated meals from plan_meals
    await connection.query(
      `DELETE FROM plan_meals WHERE diet_plan_id = ?`,
      [planId]
    );

    // 2. Then delete the diet plan itself
    const [result] = await connection.query(
      `DELETE FROM diet_plan WHERE diet_plan_id = ?`,
      [planId]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Diet plan not found'
      });
    }

    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Diet plan deleted successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.log('Error deleting diet plan:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete diet plan',
      details: err.message
    });
  } finally {
    connection.release();
  }
});

app.post('/addMealToPlan', async (req, res) => {
  const { meal_id, plan_id, user_id ,day_num} = req.body;

  try {
    // Verify the user owns the plan
    const [plans] = await pool.query(
      `SELECT trainer_id FROM diet_plan WHERE diet_plan_id = ?`,
      [plan_id]
    );

    if (plans.length === 0) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const trainer_id = plans[0].trainer_id;

    // Verify the trainer matches the user
    const [trainers] = await pool.query(
      `SELECT user_id FROM trainer WHERE trainer_id = ?`,
      [trainer_id]
    );

    if (trainers.length === 0 || trainers[0].user_id !== user_id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Add meal to plan
   const [result] = await pool.query(
      `INSERT INTO plan_meals (diet_plan_id, meal_id, day_num) VALUES (?, ?, ?)`,
      [plan_id, meal_id, day_num]
    );
    res.status(200).json({
      success: true,
      message: 'Meal added to plan successfully'
    });
  } catch (err) {
    console.log('Error adding meal to plan:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add meal to plan',
      details: err.message
    });
  }
});

app.get('/getDietPlans',async(req,res)=>{

  try{

    const [data]=await pool.query(`SELECT * FROM diet_plan`);

    console.log(data);

    return res.status(200).json({
      success: true,
      message:'Data Fetched Succesfully',
      data:data
    })


  }catch(err){
    console.log(err)
    res.status(500).json({
      success:false,
      err:'Failed To Get the Data',
      message: err.details
    })
  }

})  
// Workout Plan Endpoints

// Create a new workout plan
app.post('/workoutPlan', async (req, res) => {
  const {
    user_id,
    plan_name,
    duration_weeks,
    duration_session,
    difficulty_level,
    status,
    notes
  } = req.body;

  try {
    const randNum = Math.floor(Math.random() * (200 - 10) + 10);
    const workout_plan_id = `WP${randNum}`;

    console.log(`generated workout plan id: ${workout_plan_id}`);

    // Get trainer_id from user_id
    const [trainers] = await pool.query(
      `SELECT trainer_id FROM trainer WHERE user_id = ?`,
      [user_id]
    );

    if (trainers.length === 0) {
      return res.status(402).json({ 
        success: false, 
        error: 'Trainer not found for user_id' 
      });
    }

    const trainer_id = trainers[0].trainer_id;

    const [result] = await pool.query(
      `INSERT INTO workout_plan 
      (trainer_id, workout_plan_id, plan_name, duration_weeks, duration_session, difficulty_level, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trainer_id,
        workout_plan_id,
        plan_name,
        duration_weeks,
        duration_session,
        difficulty_level,
        status,
        notes
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Workout plan created successfully',
      workout_plan_id
    });

  } catch (err) {
    console.error("Error creating workout plan:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create workout plan",
      details: err.message
    });
  }
});

// Get all workout plans
app.get('/getWorkoutPlans', async (req, res) => {
  try {
    const [plans] = await pool.query(
      `SELECT * FROM workout_plan`
    );

    res.status(200).json({
      success: true,
      data: plans
    });

  } catch (err) {
    console.error("Error fetching workout plans:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch workout plans",
      details: err.message
    });
  }
});

// Delete a workout plan
app.delete('/deleteWorkoutPlans/:planId', async (req, res) => {
  const { planId } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // First check if plan exists
    const [planExists] = await connection.query(
      `SELECT workout_plan_id FROM workout_plan WHERE workout_plan_id = ?`,
      [planId]
    );

    if (planExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found'
      });
    }

    // First delete all associated exercises from plan_exercises
    await connection.query(
      `DELETE FROM plan_exercises WHERE workout_plan_id = ?`,
      [planId]
    );

    // Then delete the workout plan itself
    const [result] = await connection.query(
      `DELETE FROM workout_plan WHERE workout_plan_id = ?`,
      [planId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found'
      });
    }

    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Workout plan deleted successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error("Error deleting workout plan:", err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workout plan',
      details: err.message
    });
  } finally {
    connection.release();
  }
});

// Add exercise to workout plan
app.post('/addExerciseToPlan', async (req, res) => {
  const { 
    exercise_id, 
    workout_plan_id, 
    user_id,
    sets,
    reps,
    day_num
  } = req.body;

  try {
    // Verify the user owns the plan
    const [plans] = await pool.query(
      `SELECT trainer_id FROM workout_plan WHERE workout_plan_id = ?`,
      [workout_plan_id]
    );

    if (plans.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Plan not found' 
      });
    }

    const trainer_id = plans[0].trainer_id;

    // Verify the trainer matches the user
    const [trainers] = await pool.query(
      `SELECT user_id FROM trainer WHERE trainer_id = ?`,
      [trainer_id]
    );

    if (trainers.length === 0 || trainers[0].user_id !== user_id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    // Add exercise to plan
    const [result] = await pool.query(
      `INSERT INTO plan_exercises 
      (workout_plan_id, exercise_id, sets, reps, day_num) 
      VALUES (?, ?, ?, ?, ?)`,
      [workout_plan_id, exercise_id, sets, reps, day_num]
    );

    res.status(200).json({
      success: true,
      message: 'Exercise added to plan successfully'
    });

  } catch (err) {
    console.error("Error adding exercise to plan:", err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add exercise to plan',
      details: err.message
    });
  }
});

// Get exercises for a workout plan
app.get('/getPlanExercises', async (req, res) => {
  const { plan_id } = req.query;
  
  if (!plan_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'plan_id query parameter is required' 
    });
  }

  try {
    const [exercises] = await pool.query(
      `SELECT 
        pe.plan_exercise_id,
        pe.exercise_id,
        el.ex_name as name,
        el.category,
        el.equipment_needed as equipment,
        el.difficulty,
        el.video_url,
        pe.sets,
        pe.reps,
        pe.day_num,
        el.calories_burned_per_min as calories,
        el.instructions
      FROM plan_exercises pe
      JOIN exercise_library el ON pe.exercise_id = el.exercise_id
      WHERE pe.workout_plan_id = ?
      ORDER BY pe.day_num, pe.plan_exercise_id`,
      [plan_id]

    );
    console.log(exercises)

    res.json({

      success: true,
      exercises
    });
  } catch (err) {
    console.error("Error fetching plan exercises:", err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: err.message 
    });
  }
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. First get the user with all needed info in one query
    const [users] = await pool.query(
      `SELECT user_id, account_type FROM user 
       WHERE username = ? AND password_hash = ?`,
      [username, password]
    );

    if (users.length === 0) {
      console.log("Invalid Username Or Password, Try Again");
      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password",
      });
    }

    const user = users[0];
    const userId = user.user_id;
    const accountType = user.account_type;

    // 2. Check member status
    const [members] = await pool.query(
      "SELECT member_id FROM member WHERE user_id = ?",
      [userId]
    );

    // 3. Check trainer status (if you have trainer table)
    const [trainers] = await pool.query(
      "SELECT trainer_id FROM trainer WHERE user_id = ?",
      [userId]
    );

    // 4. Determine response
    if (accountType === "member") {
      if (members.length > 0) {
        return res.status(200).json({
          success: true,
          message: "USER_IS_A_MEMBER",
          user_id: userId,
          accountType: accountType,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "NEW_MEMBER",
          user_id: userId,
          accountType: accountType,
        });
      }
    } else if (accountType === "trainer") {
      if (trainers.length > 0) {
        return res.status(200).json({
          success: true,
          message: "USER_IS_A_TRAINER",
          user_id: userId,
          accountType: accountType,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "NEW_TRAINER",
          user_id: userId,
          accountType: accountType,
        });
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
