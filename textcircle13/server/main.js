Meteor.startup(function () {
  if (!Documents.findOne()) {
      Documents.insert({title : "my new documents"});
  }
});
//why the filtering of "isPrivate:false" should be in the server?
//if it is in the client, then malicious user can steal using the console to get those information. This is insecure.
Meteor.publish("documents", function(){
    return Documents.find({
        $or: [
           {isPrivate:{$ne:true}},
            {owner:this.userId}
        ]
    });
});

Meteor.publish("editingUsers", function(){
    return EditingUsers.find();
});

Meteor.publish("comments", function(){
    return Comments.find();
})
