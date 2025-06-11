const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./db");
const { error } = require("console");

app.use(cors());
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
