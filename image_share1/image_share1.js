if (Meteor.isClient) {
    console.log("This is at client")
    var image_data = [
    {
        image_source : "1.png",
        image_alt : "One large hot air balloon"
    },
    {
        image_source : "2.png",
        image_alt : "Two large hot air balloons"
    },
    {
        image_source : "3.png",
        image_alt : "All large hot air balloons"
    }
    ];
    //Template helper functions provide data for Template.
    Template.my_image.helpers({images:image_data}); 
    // instead of passing an ARRAY called image_data, pass a property that 
    // has KEY "images", and VALUE "image_data"
    // with this property structure, html TEMPLATE can iterate
    // looks like a comma ending a line, can be either omitted or kept

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    console.log("This is at server")
  });
}
