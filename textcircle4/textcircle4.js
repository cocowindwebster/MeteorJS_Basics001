if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  
  //Session.set("current_date", new Date());

  //Ask Meteor to update the session current_date every
  //1000 ms
  
  var myVar = 10; 

  Meteor.setInterval(function(){
      Session.set("current_date", new Date());
  }, 1000);

  Template.date_display.helpers({
      current_date:function() {
        return Session.get("current_date"); 
      },
      myVar:function () {
        return myVar;    
      } 
  });

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
