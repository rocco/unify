/* ************************************************************************

   feedreader

   Copyright:
     2010 Deutsche Telekom AG, Germany, http://telekom.com

 ************************************************************************ */

/* ************************************************************************

#asset(feedreader/*)

************************************************************************ */

/**
 * Unify application class
 */
qx.Class.define("feedreader.Application", 
{
  extend : unify.Application,

  members : 
  {
    // overridden
    main : function() 
    {
      // Call super class
      this.base(arguments);

      // Configure application
      document.title = "Web Tool";

      // Master view
      var MasterViewManager = new unify.view.ViewManager("master");
      MasterViewManager.add(feedreader.view.Start, true);
      MasterViewManager.add(feedreader.view.Translate);
      MasterViewManager.add(feedreader.view.Search);
      MasterViewManager.add(feedreader.view.Weather);
      MasterViewManager.add(feedreader.view.WeatherSearch);
      
      // Configure tab view
      var TabView = new unify.view.TabViewManager(MasterViewManager);
      TabView.add(feedreader.view.Start);
      TabView.add(feedreader.view.Translate);
      TabView.add(feedreader.view.Search);
      TabView.add(feedreader.view.Weather);
      this.add(TabView);
      
      // Add at least one view manager to the navigation managment
      var Navigation = unify.view.Navigation.getInstance();
      Navigation.add(MasterViewManager);
      Navigation.init();      
    }
  }
});
