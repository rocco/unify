/* ***********************************************************************************************

    Unify Project

    Homepage: unify-project.org
    License: MIT + Apache (V2)
    Copyright: 2011, Sebastian Fastner, Mainz, Germany, http://unify-training.com

*********************************************************************************************** */

/**
 * Button to support navigation
 *
 * EXPERIMENTAL
 */
 
core.Class("unify.ui.basic.NavigationButton", {
  include : [unify.ui.form.Button, unify.ui.core.MNavigatable],
  
  /**
   * @param label {String} Label on button
   */
  construct : function(label) {
    unify.ui.form.Button.call(this, label);
    
    this._applyMNavigatable();
  }
});
