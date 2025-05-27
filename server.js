const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');

app.use(cors());
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'iron-grid', 'dist', 'assets')));
app.use(express.static(path.join(__dirname, 'iron-grid', 'dist')));



app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, message: 'Database connected', solution: rows[0].solution });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed', error: err.message });
  }  
});  



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
}); 

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
  
}); 

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
}); 
app.get('/MemberRegistration', (req, res) => {
  res.sendFile(path.join(__dirname, 'iron-grid', 'dist', 'index.html'));
}); 

app.post('/register', async (req, res) => {
  const { username, firstName, lastName, email, password, gender, account_type, date_of_birth } = req.body;

  try{
    const [existing]=await pool.query(
      'SELECT user_id FROM user WHERE username=? OR email=?',
      [username,email]
    );

    if(existing.length> 0){
      
      console.log('user exists already')
    return res.status(401).json({
  success: false,
  error: 'USER_EXISTS',  // Error code
});

    }
    
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});