Images = new Mongo.Collection("images");
console.log(Images.find().count());
Images.allow({
   insert : function(userId, doc) {
        if (Meteor.user()) { //check if they are logged in
            if (doc.createdBy == userId) {
                return true;
            }
        }
        return false;
   }, 
   remove : function(userID, doc) {
        if (Meteor.user()) { //check if they are logged in
            if (doc.createdBy == userId) {
                return true;
            }
        }
        return false;
   },
   update : function(userID, doc) {
        if (Meteor.user()) { //check if they are logged in
            if (doc.createdBy == userId) {
                return true;
            }
        }
        return false;
   } 
});
