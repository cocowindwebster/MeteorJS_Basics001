if (Meteor.isClient) {
    console.log("This is at client")
    var image_data = {
        image_source : "1.png",
        image_alt : "a large hot air balloon"
    }
    //Template helper functions provide data for Template.
    Template.my_image.helpers(image_data); 
    // looks like a comma ending a line, can be either omitted or kept

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    console.log("This is at server")
  });
}
