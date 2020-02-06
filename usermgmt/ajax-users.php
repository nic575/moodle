<?php
// RESTRICT ACCESS
require_once(__DIR__ . '/../config.php');

require __DIR__ . DIRECTORY_SEPARATOR . "lib" . DIRECTORY_SEPARATOR . "config.php";

// INIT
require PATH_LIB . "lib-users.php";
$usrLib = new Users();

// HANDLE AJAX REQUEST
switch ($_POST['req']) {
  /* [INVALID REQUEST] */
  default:
    die("ERROR in ajax-users");
    break;

  /* [SHOW ALL USERS] */
  case "list":
    //printf('_' . $USER->institution . "-");
    $users = $usrLib->getAll($USER->profile['institution_id']); ?>
    <h3>Manage <?php echo $USER->institution ?> users</h3>
    <input type="button" class="btn btn-primary" value="Add User" onclick="usr.addEdit()"/>
    <br>
    <?php
    if (is_array($users)) {
      echo "<table class='admintable generaltable table-sm'>";
      echo "<thead><tr><th class='header c0 centeralign' style='' scope='col'>Name</th>";
      echo "<th class='header c1 centeralign' style='' scope='col'>Department</th>";
      echo "<th class='header c2 centeralign' style='' scope='col'>Email</th>";
      echo "<th class='header c3 centeralign' style='' scope='col'></th></tr>";
      echo "</thead>";
      foreach ($users as $u) {
        if($USER->idnumber != $u['id_number']) { printf("<tr><td>%s %s </td><td>%s</td><td>%s</td><td class='right'>"
          . "<i class='icon fa fa-trash fa-fw' title='Delete' aria-label='Delete' onclick='usr.del(%u)' ></i>"
          . "<i class='icon fa fa-cog fa-fw' title='Edit' aria-label='Edit' onclick='usr.addEdit(%u)'></i>"
          . "</td></tr>", 
          $u['firstname'], $u['lastname'],$u['department'],$u['email'],
          $u['id'], $u['id']
        );} else {
          printf("<tr><td>%s %s </td><td>%s</td><td>%s</td><td class='right'>"
          . "</td></tr>", 
          $u['firstname'], $u['lastname'],$u['department'],$u['email']
        );}
      }
      echo "</table>";
    } else {
      echo "<div>No users found.</div>";
    }
    break;

  /* [ADD/EDIT USER DOCKET] */
  case "addEdit":
    $edit = is_numeric($_POST['id']);
    if ($edit) {
      $user = $usrLib->get($_POST['id']);
    } ?>
    <h3><?=$edit?"EDIT":"ADD"?> USER</h3>
    <form> <!--onsubmit="return usr.save()"-->
      <input hidden type="text" id="id" disabled value="<?=$user['id']?>"/>
      <table class='table-sm'>
      <tr>
        <td><label class='control-label' for="name">ID Number (username):</label></td>
        <td><a class="btn btn-link p-0" role="button" data-container="body" data-toggle="popover" data-placement="right" data-content="&lt;div class=&quot;no-overflow&quot;&gt;&lt;p&gt;ID number is unique to individual and remains their key identifier irrespective of where they are employed. Once captured it cannot be edited.  &lt;/p&gt;
&lt;/div&gt; " data-html="true" data-trigger="focus">
          <i class="icon fa fa-question-circle text-info fa-fw "  title="Why ID number?" tabindex=98 aria-label="Why ID number?"></i></a></td>
        <td><input type="text" class="col-12 form-control" id="username" maxlength ="13" minlength="13" <?=$edit?"disabled":"required"?> value="<?=$user['username']?>"/></td></tr><tr>
        <td><label for="email">Email:</label></td>
        <td><a class="btn btn-link p-0" role="button" data-container="body" data-toggle="popover" data-placement="right" data-content="&lt;div class=&quot;no-overflow&quot;&gt;&lt;p&gt; Once captured it can only be edited by the user. &lt;/p&gt;
&lt;/div&gt; " data-html="true" data-trigger="focus">
          <i class="icon fa fa-question-circle text-info fa-fw " tabindex=99 title="help" aria-label="help"></i></a></td>
        <td><input type="text" class="col-12 form-control" id="email" <?=$edit?"disabled":"required"?>  value="<?=$user['email']?>"/></td></tr><tr><td>
      <label for="firstname">Firstname:</label></td><td></td><td>
      <input type="text" class="col-12 form-control" id="firstname" required value="<?=$user['firstname']?>"/></td></tr><tr><td>
      <label for="lastname">Lastname:</label></td><td></td><td>
      <input type="text" class="col-12 form-control" id="lastname" required value="<?=$user['lastname']?>"/></td></tr><tr><td>
      <label for="institution">Institution:</label><td></td></td><td>
      <input type="text" class="col-12 form-control" id="institution" disabled value="<?=$USER->institution?>"/></td></tr><tr><td>
      <label for="department">Department:</label><td></td></td><td>
      <input type="text" class="col-12 form-control" id="department" required value="<?=$user['department']?>"/></td></tr></table>
      <input type="submit" class="btn btn-primary" value="Save" onclick="usr.save()"/>
      <input type="button" class="btn btn-danger" value="Cancel" onclick="usr.list()"/>
    </form>
    <?php break;

  /* [ADD USER] */
  case "add":
   // if(get_complete_user_data('idnumber',$_POST['username'])->id === 1){

      echo $usrLib->add($_POST['username'],$_POST['firstname'],$_POST['lastname'], $_POST['institution'],$USER->profile['institution_id'],$USER->profile['cohorts'],$_POST['department'],$_POST['email'],$USER->id) ? "OK" : "ERR" ;
          error_log("Passing through ajax-users add option", 0);
    //    }
   //       else {
  //         error_log("ID number already exists",0);

  //        }
    break;

  /* [EDIT USER] */
  case "edit":
    echo $usrLib->edit($_POST['username'],$_POST['firstname'],$_POST['lastname'],$_POST['department'], $USER->id, $_POST['id']) ? "OK" : "ERR" ;

    error_log("Passing through edit in ajax-users", 0);
    break;

  /* [DELETE USER] */
  case "del":
      error_log("Passing through del in ajax-users", 0);
    echo $usrLib->del($_POST['id']) ? "OK" : "ERR" ;
    break;
}
?>