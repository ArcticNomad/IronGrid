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
    member_plan
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
    (member_plan,member_id,user_id,height,current_weight,target_weight,fitness_level,primary_goal,medical_conditions,dietary_preferences)
    VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        member_plan,
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
    console.log(error)
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
  const { forceDelete } = req.query; // Added forceDelete flag
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if plan exists
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

    // Check if plan is assigned to any members
    const [assignedMembers] = await connection.query(
      `SELECT COUNT(*) as memberCount FROM member_diet_plans WHERE diet_plan_id = ?`,
      [planId]
    );

    const hasActiveMembers = assignedMembers[0].memberCount > 0;

    if (hasActiveMembers && !forceDelete) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Diet plan has active members',
        memberCount: assignedMembers[0].memberCount,
        requiresConfirmation: true
      });
    }

    // If we get here, either no members or forceDelete=true

    // First delete member assignments (if force deleting)
    if (hasActiveMembers) {
      await connection.query(
        `DELETE FROM member_diet_plans WHERE diet_plan_id = ?`,
        [planId]
      );
    }

    // Delete all associated meals from plan_meals
    await connection.query(
      `DELETE FROM plan_meals WHERE diet_plan_id = ?`,
      [planId]
    );

    // Delete the diet plan itself
    const [result] = await connection.query(
      `DELETE FROM diet_plan WHERE diet_plan_id = ?`,
      [planId]
    );

    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: hasActiveMembers 
        ? 'Diet plan and all member assignments deleted successfully' 
        : 'Diet plan deleted successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error("Error deleting diet plan:", err);
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
  const { forceDelete } = req.query; // Added forceDelete flag
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if plan exists
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

    // Check if plan is assigned to any members
    const [assignedMembers] = await connection.query(
      `SELECT COUNT(*) as memberCount FROM member_workout_plans WHERE workout_plan_id = ?`,
      [planId]
    );

    const hasActiveMembers = assignedMembers[0].memberCount > 0;

    if (hasActiveMembers && !forceDelete) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Workout plan has active members',
        memberCount: assignedMembers[0].memberCount,
        requiresConfirmation: true
      });
    }

    // If we get here, either no members or forceDelete=true

    // First delete member assignments (if force deleting)
    if (hasActiveMembers) {
      await connection.query(
        `DELETE FROM member_workout_plans WHERE workout_plan_id = ?`,
        [planId]
      );
    }

    // Delete all associated exercises
    await connection.query(
      `DELETE FROM plan_exercises WHERE workout_plan_id = ?`,
      [planId]
    );

    // Delete the workout plan itself
    const [result] = await connection.query(
      `DELETE FROM workout_plan WHERE workout_plan_id = ?`,
      [planId]
    );

    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: hasActiveMembers 
        ? 'Workout plan and all member assignments deleted successfully' 
        : 'Workout plan deleted successfully'
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

    const member_id=members[0]
    // 3. Check trainer status (if you have trainer table)
    const [trainers] = await pool.query(
      "SELECT trainer_id FROM trainer WHERE user_id = ?",
      [userId]
    );

    const trainer_id=trainers[0]

    // 4. Determine response
    if (accountType === "member") {
      if (members.length > 0) {
        return res.status(200).json({
          success: true,
          message: "USER_IS_A_MEMBER",
          user_id: userId,
          accountType: accountType,
          member_id:member_id
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
          trainer_id:trainer_id
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

// Get member data (updated)
app.get('/api/member/:userId/data', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching data for user:', userId);
    
    const [results] = await pool.query('CALL GetMemberDashboardData(?)', [userId]);
    console.log('Raw DB results:', results);

    // The stored procedure now returns exactly one row
    if (!results || results.length === 0 || results[0].length === 0) {
      console.log('No member found for user:', userId);
      return res.status(404).json({ error: 'Member not found' });
    }

    const memberData = results[0][0]; // Get the first (and only) row
    console.log('Member data from DB:', memberData);
    
    const response = {
      success: true,
      name: memberData.name || '',
      currentWeight: parseFloat(memberData.current_weight) || 0,
      targetWeight: parseFloat(memberData.target_weight) || 0,
      fitnessLevel: parseInt(memberData.fitness_level) || 0,
      activeWorkoutPlan: memberData.active_workout_plan || 'Not assigned',
      activeDietPlan: memberData.active_diet_plan || 'Not assigned',
      memberId: memberData.member_id || ''
    };

    console.log('Final API response:', response);
    res.json(response);

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// Get member's active workout plan details
app.get('/api/member/:memberId/workout-plan', async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get the active workout plan
    const [plans] = await pool.query(`
      SELECT 
        workout_plan.*,
        CONCAT(user.first_name, ' ', user.last_name) AS trainer_name
      FROM workout_plan
      JOIN member_workout_plans ON workout_plan.workout_plan_id = member_workout_plans.workout_plan_id
      JOIN trainer ON workout_plan.trainer_id = trainer.trainer_id
      JOIN user ON trainer.user_id = user.user_id
      WHERE member_workout_plans.member_id = ? AND workout_plan.status = 'active'
      ORDER BY member_workout_plans.assigned_date DESC LIMIT 1
    `, [memberId]);

    if (plans.length === 0) {
      return res.json({ 
        success: true,
        message: 'No active workout plan found' 
      });
    }

    const workoutPlan = plans[0];

    // Get exercises for this plan
    const [exercises] = await pool.query(`
      SELECT 
        plan_exercises.*, 
        exercise_library.ex_name, 
        exercise_library.category,
        exercise_library.equipment_needed,
        exercise_library.difficulty,
        exercise_library.video_url,
        exercise_library.instructions
      FROM plan_exercises
      JOIN exercise_library ON plan_exercises.exercise_id = exercise_library.exercise_id
      WHERE plan_exercises.workout_plan_id = ?
      ORDER BY plan_exercises.day_num, plan_exercises.plan_exercise_id
    `, [workoutPlan.workout_plan_id]);

    res.json({
      success: true,
      workoutPlan: {
        ...workoutPlan,
        exercises
      }
    });
  } catch (err) {
    console.error('Error fetching workout plan:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch workout plan' });
  }
});

// Get exercises for a specific workout plan (for preview)
app.get('/api/workout-plans/:planId/exercises', async (req, res) => {
  try {
    const { planId } = req.params;
    
    const [exercises] = await pool.query(`
      SELECT 
        plan_exercises.*, 
        exercise_library.ex_name, 
        exercise_library.category,
        exercise_library.equipment_needed,
        exercise_library.difficulty,
        exercise_library.video_url,
        exercise_library.instructions
      FROM plan_exercises
      JOIN exercise_library ON plan_exercises.exercise_id = exercise_library.exercise_id
      WHERE plan_exercises.workout_plan_id = ?
      ORDER BY plan_exercises.day_num, plan_exercises.plan_exercise_id
      LIMIT 5
    `, [planId]);

    res.json({
      success: true,
      exercises
    });
  } catch (err) {
    console.error('Error fetching plan exercises:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch exercises' });
  }
});

// Get available workout plans for members (with preview exercises)
app.get('/api/workout-plans/available', async (req, res) => {
  try {
    const [plans] = await pool.query(`
      SELECT 
        workout_plan.workout_plan_id,
        workout_plan.plan_name,
        workout_plan.duration_weeks,
        workout_plan.duration_session,
        workout_plan.difficulty_level,
        workout_plan.notes,
        CONCAT(user.first_name, ' ', user.last_name) AS trainer_name
      FROM workout_plan
      JOIN trainer ON workout_plan.trainer_id = trainer.trainer_id
      JOIN user ON trainer.user_id = user.user_id
      WHERE workout_plan.status = 'active'
    `);
    console.log("Workout plans from DB:", plans);

    // Get preview exercises for each plan
    const plansWithExercises = await Promise.all(plans.map(async plan => {
      const [exercises] = await pool.query(`
        SELECT 
          plan_exercises.exercise_id,
          exercise_library.ex_name,
          plan_exercises.sets,
          plan_exercises.reps
        FROM plan_exercises
        JOIN exercise_library ON plan_exercises.exercise_id = exercise_library.exercise_id
        WHERE plan_exercises.workout_plan_id = ?
        LIMIT 3
      `, [plan.workout_plan_id]);
      
      return {
        ...plan,
        previewExercises: exercises
      };
    }));

    res.json({
      success: true,
      plans: plansWithExercises
    });
  } catch (err) {
    console.log(err)
    console.error('Error fetching workout plans:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch workout plans' });
  }
});

// Assign workout plan to member
app.post('/api/member/assign-workout-plan', async (req, res) => {
  const { member_id, workout_plan_id } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if member already has this plan assigned
    const [existing] = await connection.query(`
      SELECT * FROM member_workout_plans 
      WHERE member_id = ? AND workout_plan_id = ?
    `, [member_id, workout_plan_id]);

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'Plan already assigned to member' 
      });
    }

    // Assign the new plan
    await connection.query(`
      INSERT INTO member_workout_plans (member_id, workout_plan_id)
      VALUES (?, ?)
    `, [member_id, workout_plan_id]);

    // Get plan name for response
    const [plan] = await connection.query(`
      SELECT plan_name FROM workout_plan 
      WHERE workout_plan_id = ?
    `, [workout_plan_id]);

    await connection.commit();

    res.json({ 
      success: true,
      message: 'Workout plan assigned successfully',
      plan_name: plan[0].plan_name
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error assigning workout plan:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to assign workout plan' 
    });
  } finally {
    connection.release();
  }
});

// Get member ID from user ID
app.get('/api/member/user/:user_id/id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const [member] = await pool.query(`
      SELECT member_id FROM member 
      WHERE user_id = ?
    `, [user_id]);

    if (member.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    res.json({
      success: true,
      member_id: member[0].member_id
    });
  } catch (err) {
    console.error('Error fetching member ID:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch member ID' 
    });
  }
});

// Get member's active diet plan details
app.get('/api/member/:memberId/diet-plan', async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get the active diet plan
    const [plans] = await pool.query(`
      SELECT 
        diet_plan.*,
        CONCAT(user.first_name, ' ', user.last_name) AS trainer_name
      FROM diet_plan
      JOIN member_diet_plans ON diet_plan.diet_plan_id = member_diet_plans.diet_plan_id
      JOIN trainer ON diet_plan.trainer_id = trainer.trainer_id
      JOIN user ON trainer.user_id = user.user_id
      WHERE member_diet_plans.member_id = ? AND diet_plan.status = 'active'
      ORDER BY member_diet_plans.assigned_date DESC LIMIT 1
    `, [memberId]);

    if (plans.length === 0) {
      return res.json({ 
        success: true,
        message: 'No active diet plan found' 
      });
    }

    const dietPlan = plans[0];

    // Get meals for this plan
    const [meals] = await pool.query(`
      SELECT 
        plan_meals.day_num,
        meal_library.meal_id,
        meal_library.meal_name,
        meal_library.meal_type,
        meal_library.preparation_time,
        meal_library.recipe_url,
        meal_nutrition.serving_size,
        meal_nutrition.calories,
        meal_nutrition.protein,
        meal_nutrition.carbs,
        meal_nutrition.fat,
        meal_nutrition.fiber
      FROM plan_meals
      JOIN meal_library ON plan_meals.meal_id = meal_library.meal_id
      JOIN meal_nutrition ON meal_library.meal_id = meal_nutrition.meal_id
      WHERE plan_meals.diet_plan_id = ?
      ORDER BY plan_meals.day_num, 
        CASE meal_library.meal_type
          WHEN 'Breakfast' THEN 1
          WHEN 'Lunch' THEN 2
          WHEN 'Dinner' THEN 3
          WHEN 'Snack' THEN 4
          ELSE 5
        END
    `, [dietPlan.diet_plan_id]);

    res.json({
      success: true,
      dietPlan: {
        ...dietPlan,
        meals
      }
    });
  } catch (err) {
    console.error('Error fetching diet plan:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch diet plan' });
  }
});

// Get available diet plans for members (with preview meals)
app.get('/api/diet-plans/available', async (req, res) => {
  try {
    const [plans] = await pool.query(`
      SELECT 
        diet_plan.diet_plan_id,
        diet_plan.plan_name,
        diet_plan.daily_calories,
        diet_plan.cuisine_preferences,
        CONCAT(user.first_name, ' ', user.last_name) AS trainer_name
      FROM diet_plan
      JOIN trainer ON diet_plan.trainer_id = trainer.trainer_id
      JOIN user ON trainer.user_id = user.user_id
      WHERE diet_plan.status = 'active'
    `);

    // Get preview meals for each plan
    const plansWithMeals = await Promise.all(plans.map(async plan => {
      const [meals] = await pool.query(`
        SELECT 
          meal_library.meal_name,
          meal_library.meal_type
        FROM plan_meals
        JOIN meal_library ON plan_meals.meal_id = meal_library.meal_id
        WHERE plan_meals.diet_plan_id = ?
        LIMIT 3
      `, [plan.diet_plan_id]);
      
      return {
        ...plan,
        previewMeals: meals
      };
    }));

    res.json({
      success: true,
      plans: plansWithMeals
    });
  } catch (err) {
    console.error('Error fetching diet plans:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch diet plans' });
  }
});

// Assign diet plan to member
app.post('/api/member/assign-diet-plan', async (req, res) => {
  const { member_id, diet_plan_id } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if member already has this plan assigned
    const [existing] = await connection.query(`
      SELECT * FROM member_diet_plans 
      WHERE member_id = ? AND diet_plan_id = ?
    `, [member_id, diet_plan_id]);

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'Plan already assigned to member' 
      });
    }

    // Assign the new plan
    await connection.query(`
      INSERT INTO member_diet_plans (member_id, diet_plan_id)
      VALUES (?, ?)
    `, [member_id, diet_plan_id]);

    // Get plan name for response
    const [plan] = await connection.query(`
      SELECT plan_name FROM diet_plan 
      WHERE diet_plan_id = ?
    `, [diet_plan_id]);

    await connection.commit();

    res.json({ 
      success: true,
      message: 'Diet plan assigned successfully',
      plan_name: plan[0].plan_name
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error assigning diet plan:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to assign diet plan' 
    });
  } finally {
    connection.release();
  }
});
// Delete workout plan assignment
app.delete('/api/member/delete-workout-plan', async (req, res) => {
  const { member_id } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Delete from member_workout_plans
    await connection.query(
      'DELETE FROM member_workout_plans WHERE member_id = ?',
      [member_id]
    );
    
    // // Optionally update members table if you track active plans there
    // await connection.query(
    //   'UPDATE member SET active_workout_plan_id = NULL WHERE member_id = ?',
    //   [member_id]
    // );
    
    await connection.commit();
    res.json({ 
      success: true,
      message: 'Workout plan assignment deleted successfully'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting workout plan:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete workout plan' 
    });
  } finally {
    connection.release();
  }
});

// Delete diet plan assignment
app.delete('/api/member/delete-diet-plan', async (req, res) => {
  const { member_id } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Delete from member_diet_plans
    await connection.query(
      'DELETE FROM member_diet_plans WHERE member_id = ?',
      [member_id]
    );
    
    // Optionally update members table if you track active plans there
    // await connection.query(
    //   'UPDATE member SET active_diet_plan_id = NULL WHERE member_id = ?',
    //   [member_id]
    // );
    
    await connection.commit();
    res.json({ 
      success: true,
      message: 'Diet plan assignment deleted successfully'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting diet plan:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete diet plan' 
    });
  } finally {
    connection.release();
  }
});

// Add progress entry
app.post('/api/progress', async (req, res) => {
  const { member_id, weight, body_fat_percentage, muscle_mass, measurements, notes } = req.body;

  if (!member_id || !weight) {
    return res.status(400).json({ 
      success: false, 
      error: 'member_id and weight are required fields' 
    });
  }

  try {
    // Generate entry_id
    const entry_id = `PE${Date.now().toString().slice(-8)}`;
    
    const [result] = await pool.query(
      `INSERT INTO progress_entry 
      (entry_id, member_id, weight, body_fat_percentage, muscle_mass, measurements, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entry_id,
        member_id,
        weight,
        body_fat_percentage || null,
        muscle_mass || null,
        measurements ? JSON.stringify(measurements) : null,
        notes || null
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Progress entry added successfully',
      entry_id: entry_id
    });

  } catch (err) {
    console.error("Error adding progress entry:", err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add progress entry',
      details: err.message
    });
  }
});

// Get all progress entries for a member
// Update your GET endpoint to ensure it always returns an array
// Update your GET endpoint to ensure proper data retrieval
app.get('/api/progress/:memberId', async (req, res) => {
  const { memberId } = req.params;
  
  if (!memberId) {
    return res.status(400).json({ 
      success: false, 
      error: 'memberId parameter is required' 
    });
  }

  try {
    const [entries] = await pool.query(
      `SELECT 
        entry_id,
        member_id,
        entry_date,
        weight,
        body_fat_percentage,
        muscle_mass,
        measurements,
        notes
      FROM progress_entry
      WHERE member_id = ?
      ORDER BY entry_date DESC`,
      [memberId]
    );

    // Validate and transform the data
    const formattedEntries = entries.map(entry => {
      // Generate a temporary ID if missing
      const entryId = entry.entry_id || `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Parse measurements safely
      let measurements = null;
      try {
        measurements = entry.measurements ? JSON.parse(entry.measurements) : null;
      } catch (e) {
        console.error('Failed to parse measurements:', e);
      }

      return {
        entry_id: entryId,
        member_id: entry.member_id,
        entry_date: entry.entry_date || new Date().toISOString(),
        weight: entry.weight !== undefined && entry.weight !== null ? entry.weight : null,
        body_fat_percentage: entry.body_fat_percentage !== undefined && entry.body_fat_percentage !== null ? entry.body_fat_percentage : null,
        muscle_mass: entry.muscle_mass !== undefined && entry.muscle_mass !== null ? entry.muscle_mass : null,
        measurements,
        notes: entry.notes || ''
      };
    });

    res.status(200).json({
      success: true,
      entries: formattedEntries
    });
  } catch (err) {
    console.error("Error fetching progress entries:", err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch progress entries',
      details: err.message,
      entries: [] // Return empty array on error
    });
  }
});

// Get latest progress entry for a member
app.get('/api/progress/latest/:memberId', async (req, res) => {
  const { memberId } = req.params;
  
  if (!memberId) {
    return res.status(400).json({ 
      success: false, 
      error: 'memberId parameter is required' 
    });
  }

  try {
    const [entries] = await pool.query(
      `SELECT 
        entry_id,
        member_id,
        entry_date,
        weight,
        body_fat_percentage,
        muscle_mass,
        measurements,
        notes
      FROM progress_entry
      WHERE member_id = ?
      ORDER BY entry_date DESC
      LIMIT 1`,
      [memberId]
    );

    if (entries.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No progress entries found',
        entry: null
      });
    }

    // Parse JSON measurements if they exist
    const entry = {
      ...entries[0],
      measurements: entries[0].measurements ? JSON.parse(entries[0].measurements) : null
    };

    res.status(200).json({
      success: true,
      entry
    });
  } catch (err) {
    console.error("Error fetching latest progress entry:", err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch latest progress entry',
      details: err.message 
    });
  }
});

// Delete a progress entry
app.delete('/api/progress/:entryId', async (req, res) => {
  const { entryId } = req.params;
  
  if (!entryId) {
    return res.status(400).json({ 
      success: false, 
      error: 'entryId parameter is required' 
    });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM progress_entry
      WHERE entry_id = ?`,
      [entryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Progress entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Progress entry deleted successfully'
    });
  } catch (err) {
    console.error("Error deleting progress entry:", err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete progress entry',
      details: err.message 
    });
  }
});


app.post('/api/workout-sessions', async (req, res) => {
  const { member_id, workout_plan_name, start_time, notes } = req.body;

  if (!member_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'member_id is required' 
    });
  }

  try {
    let workout_plan_id = null;
    
    // If plan name was provided, look up the actual ID
    if (workout_plan_name) {
      const [plans] = await pool.query(
        `SELECT workout_plan_id 
         FROM workout_plan 
         WHERE plan_name = ? AND status = 'active'`,
        [workout_plan_name]
      );
      
      if (plans.length > 0) {
        workout_plan_id = plans[0].workout_plan_id;
      } else {
        return res.status(400).json({
          success: false,
          error: 'No active workout plan found with that name'
        });
      }
    }

    // Generate session ID (10 chars max)
    const session_id = `WS${Date.now().toString().slice(-8)}`;
    
    // Insert new session with the resolved ID
    const [result] = await pool.query(
      `INSERT INTO workout_session 
      (session_id, member_id, workout_plan_id, start_time, notes) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        session_id, 
        member_id, 
        workout_plan_id, 
        start_time || new Date().toISOString(), 
        notes || null
      ]
    );

    // Get the newly created session with plan name
    const [session] = await pool.query(
      `SELECT ws.*, wp.plan_name 
       FROM workout_session ws
       LEFT JOIN workout_plan wp ON ws.workout_plan_id = wp.workout_plan_id
       WHERE ws.session_id = ?`,
      [session_id]
    );

    res.status(201).json({ 
      success: true,
      session: session[0]
    });
  } catch (error) {
    console.error('Error creating workout session:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create workout session',
      details: error.message
    });
  }
});
// End a workout session
app.put('/api/workout-sessions/:sessionId/end', async (req, res) => {
  const { sessionId } = req.params;
  const { total_calories, session_rating, completed_percentage, notes } = req.body;

  try {
    // Update session with end time and optional fields
    const [result] = await pool.query(
      `UPDATE workout_session 
       SET end_time = NOW(),
           total_calories = ?,
           session_rating = ?,
           completed_percentage = ?,
           notes = COALESCE(?, notes)
       WHERE session_id = ? AND end_time IS NULL`,
      [
        total_calories || null,
        session_rating || null,
        completed_percentage || null,
        notes || null,
        sessionId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Session not found or already ended'
      });
    }

    // Get the updated session with plan name
    const [session] = await pool.query(
      `SELECT ws.*, wp.plan_name 
       FROM workout_session ws
       LEFT JOIN workout_plan wp ON ws.workout_plan_id = wp.workout_plan_id
       WHERE ws.session_id = ?`,
      [sessionId]
    );

    res.status(200).json({ 
      success: true,
      session: session[0]
    });
  } catch (error) {
    console.error('Error ending workout session:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to end workout session',
      details: error.message
    });
  }
});

// Get all workout sessions for a member
app.get('/api/workout-sessions/:memberId', async (req, res) => {
  const { memberId } = req.params;
  
  if (!memberId) {
    return res.status(400).json({ 
      success: false, 
      error: 'memberId parameter is required' 
    });
  }

  try {
    const [sessions] = await pool.query(
      `SELECT ws.*, wp.plan_name 
       FROM workout_session ws
       LEFT JOIN workout_plan wp ON ws.workout_plan_id = wp.workout_plan_id
       WHERE ws.member_id = ?
       ORDER BY ws.start_time DESC`,
      [memberId]
    );

    res.status(200).json({ 
      success: true,
      sessions: sessions || []
    });
  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch workout sessions',
      details: error.message,
      sessions: []
    });
  }
});

// Get active workout plans for member
app.get('/api/member/:memberId/workout-plans', async (req, res) => {
  const { memberId } = req.params;
  
  if (!memberId) {
    return res.status(400).json({ 
      success: false, 
      error: 'memberId parameter is required' 
    });
  }

  try {
    const [plans] = await pool.query(
      `SELECT wp.workout_plan_id AS plan_id, wp.plan_name
       FROM member_workout_plans mwp
       JOIN workout_plan wp ON mwp.workout_plan_id = wp.workout_plan_id
       WHERE mwp.member_id = ? AND wp.status = 'active'`,
      [memberId]
    );

    res.status(200).json({ 
      success: true,
      plans: plans || []
    });
  } catch (error) {
    console.error('Error fetching active workout plans:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch active workout plans',
      details: error.message,
      plans: []
    });
  }
});

// Add exercise to session
app.post('/api/workout-sessions/:sessionId/exercises', async (req, res) => {
  const { sessionId } = req.params;
  const { exercise_id, actual_sets, actual_reps, weight_used, notes } = req.body;

  try {
    // Check if session exists and is active
    const [session] = await pool.query(
      `SELECT 1 FROM workout_session WHERE session_id = ? AND end_time IS NULL`,
      [sessionId]
    );

    if (session.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Session not found or already ended'
      });
    }

    await pool.query(
      `INSERT INTO session_details 
      (session_id, exercise_id, actual_sets, actual_reps, weight_used, notes) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, exercise_id, actual_sets, actual_reps, weight_used, notes]
    );

    res.status(201).json({ 
      success: true,
      message: 'Exercise added to session'
    });
  } catch (error) {
    console.error('Error adding exercise to session:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add exercise to session',
      details: error.message
    });
  }
});

// Get exercises for a session
app.get('/api/workout-sessions/:sessionId/exercises', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const [exercises] = await pool.query(
`SELECT sd.*, el.ex_name AS exercise_name, el.category, el.equipment_needed, el.difficulty
 FROM session_details sd
 JOIN exercise_library el ON sd.exercise_id = el.exercise_id
 WHERE sd.session_id = ?`,
      [sessionId]
    );

    res.status(200).json({ 
      success: true,
      exercises: exercises || []
    });
  } catch (error) {
    console.error('Error fetching session exercises:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch session exercises',
      details: error.message,
      exercises: []
    });
  }
});
// Get all exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const [exercises] = await pool.query(
      `SELECT exercise_id, ex_name AS exercise_name,category,equipment_needed,difficulty
       FROM exercise_library`
    );

    res.status(200).json({ 
      success: true,
      exercises: exercises || []
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch exercises',
      details: error.message
    });
  }
});
app.delete('/api/workout-sessions/:sessionId', async (req, res) => {
  const sessionID = req.params.sessionId;
  console.log('sessoino id ', sessionID )
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. First delete from session_details (child table)
    const [detailResult] = await connection.query(
      'DELETE FROM session_details WHERE session_id = ?',
      [sessionID]
    );

    // 2. Then delete from workout_session (parent table)
    const [sessionResult] = await connection.query(
      'DELETE FROM workout_session WHERE session_id = ?',
      [sessionID]
    );

    if (sessionResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Session not found' });
    }

    await connection.commit();
    res.status(200).json({ 
      message: 'Session deleted successfully',
      deletedSessionId: sessionID,
      deletedExercises: detailResult.affectedRows 
    });
    
  } catch (err) {
    console.log(err)
    await connection.rollback();
    console.error('Error deleting workout session:', err);
    res.status(500).json({ 
      error: 'Failed to delete session',
      details: err.message 
    });
  } finally {
    connection.release();
  }
});