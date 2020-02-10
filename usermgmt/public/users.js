var usr = {
  list : function () {
  // list() : show all the users

    adm.load({
      url : "ajax-users.php",
      target : "container",
      data : {
        req : "list"
      }
    });
  },

  addEdit : function (id) {
  // addEdit() : show add/edit user docket
  // PARAM id : user ID

    adm.load({
      url : "ajax-users.php",
      target : "container",
      data : {
        req : "addEdit",
        id : id
      },
    });
  },
  
  checkUser : function(onDone) {
    
        var userName = document.getElementById("username").value;
    
      adm.ajax({
          url : 'ajax-users.php',
          data : {
             req : 'check',
             username : userName
          },
          ok : function(response) {
              
              if(onDone)
                  onDone();
          },
          error : function(response) {
              
              alert('The username "' + userName + '" already exists.');              
          }
      });
  },

  save : function () {
  // save() : save user

    var id = document.getElementById("id").value;
   // alert($institution);
    adm.ajax({
      url : "ajax-users.php",
      data : {
        req : (id=="" ? "add" : "edit"),
        id : id,
        username : document.getElementById("username").value,
        firstname : document.getElementById("firstname").value,
        lastname : document.getElementById("lastname").value,
        institution : document.getElementById("institution").value,
        department : document.getElementById("department").value,
        email : document.getElementById("email").value 
      },
      ok : usr.list
    });
    return false;
  },

  del : function (id) {
  // del() : delete user
  // PARAM id : user ID

    if (confirm("Delete user?")) {
      adm.ajax({
        url : "ajax-users.php",
        data : {
          req : "del",
          id : id
        },
        ok : usr.list
      });
    }
  }
};

window.addEventListener("load", usr.list);