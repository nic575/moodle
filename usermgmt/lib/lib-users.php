<?php
class Users {
  private $pdo = null;
  private $stmt = null;

  function __construct () {
  // __construct() : connect to the database
  // PARAM : DB_HOST, DB_CHARSET, DB_NAME, DB_USER, DB_PASSWORD

    try {
      $this->pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASSWORD, [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
          PDO::ATTR_EMULATE_PREPARES => false
        ]
      );
      return true;
    } catch (Exception $ex) {
        
        die($ex->getMessage());
        
      $this->CB->verbose(0, "DB",$ex->getMessage() , "", 1); 
    }
  }

  function __destruct () {
  // __destruct() : close connection when done

    if ($this->stmt !== null) {
      $this->stmt = null;
    }
    if ($this->pdo !== null) {
      $this->pdo = null;
    }
  }

  function get ($id) {
  // get() : get user
  // PARAM $id : user ID, institution

    $sql = "SELECT * FROM `users` WHERE `id`=?";
    $this->stmt = $this->pdo->prepare($sql);
    $this->stmt->execute([$id]);
    $entry = $this->stmt->fetchAll();
    return count($entry)==0 ? false : $entry[0] ;
  }

  function getByEmail ($email) {
  // get() : get user by email
  // PARAM $email : user email

    $sql = "SELECT * FROM `users` WHERE `email`=?";
    $this->stmt = $this->pdo->prepare($sql);
    $this->stmt->execute([$email]);
    $entry = $this->stmt->fetchAll();
    return count($entry)==0 ? false : $entry[0] ;
  }

  function getAll ($institution_id) {
  // getAll() : get all users

    $sql = "SELECT * FROM `users` WHERE `institution_id` = ?";
    $this->stmt = $this->pdo->prepare($sql);
    $this->stmt->execute([$institution_id]);
    $entry = $this->stmt->fetchAll();
    return count($entry)==0 ? false : $entry ;
  }

  // Justus Meyer, 2020/02/07:
  function userExists($userName) {
      
      $sql = "SELECT `username` FROM `users` WHERE `username` = :userName";

      try {
          
          $this->stmt = $this->pdo->prepare($sql);
          $this->stmt->execute([ ':userName' => $userName ]);
          
          if($this->stmt->rowCount() > 0) {
              
              return true;
          }
          
      } catch (Exception $ex) {

          error_log($ex->getMessage(), $ex->getCode());
          throw $ex;
      }
      
      return false;
  }
  
  function add ($username, $firstname, $lastname, $institution, $institution_id, $cohorts, $department, $email,$kiuserid) {
  // add() : add a new user
  // PARAM $email - email
  //       $name - name
  //       $password - password (clear text)
   
    $sql = "INSERT INTO `users` (`username`,`firstname`,`lastname`,`id_number`,`institution`,`institution_id`,`cohorts`,`department`,`email`, `created_at`, `created_by`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    // $cond = [];
   
    $cond = [$username,$firstname, $lastname, $username, $institution,$institution_id, $cohorts, $department, $email,date("Y-m-d H:i:s"), $kiuserid];
    try {
      $this->stmt = $this->pdo->prepare($sql);
      $this->stmt->execute($cond);
    } catch (Exception $ex) {
      error_log($ex, 0);
      return false;
    }
    return true;
  }

  function edit ($username, $firstname, $lastname, $department, $kiuserid, $id) {
  // edit() : update user

    $sql = "UPDATE `users` SET `firstname`=?,`lastname`=?,`department`=?, altered_by = ? WHERE `id`=?";
    $cond = [$firstname,$lastname, $department, $kiuserid, $id];
    try {
      $this->stmt = $this->pdo->prepare($sql);
      $this->stmt->execute($cond);
    } catch (Exception $ex) {
      error_log($ex, 0);
      return false;
    }
    return true;
  }

  function del ($id) {
  // del() : delete user

    $sql = "DELETE FROM `users` WHERE `id`=?";
    try {
      $this->stmt = $this->pdo->prepare($sql);
      $this->stmt->execute([$id]);
    } catch (Exception $ex) {
      return false;
    }
    return true;
  }

 /* function addcohorts ($id, $institution_id) {
    $sql = "INSERT INTO users (cohorts) values (,1,2,) where 'id' = ?";
    $cond = [$id];
    try {
      $this->stmt = $this->pdo->prepart($sql);
      $this->stmt->execute($cond);
    } catch (Exception $ex) {
      error_log($ex, 0);
      return false;
    }
      return true;
    }*/
    
  
}
?>