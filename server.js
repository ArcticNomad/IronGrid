const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');
const { error } = require('console');

app.use(cors());
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'iron-grid', 'dist', 'assets')));
app.use(express.static(path.join(__dirname, 'iron-grid', 'dist')));



// app.get('/test-db', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT 1 + 1 AS solution');
//     res.json({ success: true, message: 'Database connected', solution: rows[0].solution });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Database connection failed', error: err.message });
//   }  
// });  


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
}); 

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
}); 
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
  
}); 

app.get('/MemberRegister', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
}); 

app.post('/register', async (req, res) => {
  const { username, firstName, lastName, email, password, gender, account_type, date_of_birth } = req.body;

  try{

    // check if user already exists
    const [existing]= await pool.query(
      'SELECT user_id FROM user WHERE user_id=? OR email=?',
      [username,email]
    );

    if(existing.length> 0){
      
      console.log('user exists already')
    return res.status(401).json({
  success: false,
  error: 'USER_EXISTS',  // Error code
  message: 'User Already Exists'
});
}

// check if username already exists 

const[existingMember]= await pool.query(`SELECT username FROM user WHERE username=?`,[username]);

if(existingMember.length>0){
  console.log('username taken')
    return res.status(402).json({
  success: false,
  error: 'Username_Taken',  // Error code
  message: 'Username Is Taken'
})
}
  // generate random userID
    const randNum= Math.floor(Math.random()* (200 - 10) + 10);
    const user_id= `U${randNum}`
    

    console.log(`generated User id : ${user_id}`);

    const formattedRegistrationDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const formattedBirthDate = date_of_birth || null; // Handle NULL if not provided
    
    const [result] = await pool.query(
      `INSERT INTO user
       (user_id,username,password_hash,email,first_name,last_name,date_of_birth,gender, registration_date,account_type) 
       VALUES(?,?,?,?,?,?,?,?,?,?)`,
        [user_id,username, password, email, firstName, lastName, formattedBirthDate, gender,formattedRegistrationDate,account_type]
    )
      console.log(user_id,username, password, email, firstName, lastName, formattedBirthDate, gender,formattedRegistrationDate,account_type);

        res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.insertId,
        username,
        email,
        account_type
      }
    }
  );


  }catch(error){
   console.error('Registration error:', error);
     res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    });
  }

});

app.post('/MemberRegistration', async(req, res)=>{

const {username,height,current_weight,target_weight,fitness_level,primary_goal,medical_conditions,dietary_preferences}=req.body;

try{

  // check if user with the username exists 

  const[existingMem]=await pool.query(`SELECT user_id FROM user WHERE username=?`,[username])

  if(existingMem.length <=0){
    res.status(403).json({
      success : false,
      error: 'Invalid Username, No Such User Exists',
      message: 'No Such User Exists'
    })
  }
  const user_id=await pool.query(`SELECT user_id FROM user WHERE username=?`,[username])

  const randNum= Math.floor(Math.random()* (200 - 10) + 10);
    const member_id= `M${randNum}`
    

    console.log(`generated Member id : ${user_id}`);

  const [result]=await pool.query(`INSERT INTO member 
    (member_id,height,current_weight,target_weight,fitness_level,primary_goal,medical_conditions,dietary_preferences)
    VALUES (?,?,?,?,?,?,?,?)`,
    [member_id,height,current_weight,target_weight,fitness_level,primary_goal,medical_conditions,dietary_preferences]
  )
  console.log(result)
    res.status(200).json({
      success: true,
      message: 'Member Registered Succesfully',
      member:{
        result
      }
    })

}catch(error){
  res.status(500).json({
    success: false,
    error: 'Registration failed',
    details: error.message
  })
}

})

app.get('/TrainerRegistration' ,(req,res)=>{
    res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. First get the user with all needed info in one query
    const [users] = await pool.query(
      `SELECT user_id, account_type FROM user 
       WHERE username = ? AND password_hash = ?`,
      [username, password]
    );

    if (users.length === 0) {
      console.log('Invalid Username Or Password, Try Again');
      return res.status(401).json({
        success: false,
        message: 'Invalid Username or Password'
      });
    }

    const user = users[0];
    const userId = user.user_id;
    const accountType = user.account_type;

    // 2. Check member status
    const [members] = await pool.query(
      'SELECT member_id FROM member WHERE user_id = ?',
      [userId]
    );

    // 3. Check trainer status (if you have trainer table)
    const [trainers] = await pool.query(
      'SELECT trainer_id FROM trainer WHERE user_id = ?',
      [userId]
    );

    // 4. Determine response
    if (accountType === 'member') {
      if (members.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'USER_IS_A_MEMBER',
          user_id: userId,
          accountType: accountType
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'NEW_MEMBER',
          user_id: userId,
          accountType: accountType
        });
      }
    } else if (accountType === 'trainer') {
      if (trainers.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'USER_IS_A_TRAINER',
          user_id: userId,
          accountType: accountType
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'NEW_TRAINER',
          user_id: userId,
          accountType: accountType 
        });
      }
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
