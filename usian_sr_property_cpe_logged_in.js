describe("usian_sr_property_cpr_logged_in", function () {
it("tests usian_sr_property_cpr_logged_in", function (browser) {
  browser.windowRect({width: 1920, height: 1080})
  .navigateTo("https://usain.portal.stgeuw.em.verintcloudservices.com/site/simple_form_portal/home")
  .waitForElementVisible("#nav_login")
  .click("#nav_login")
  .waitForElementVisible("#username")
  .click("#username")
  .setValue("#username", "hjaya")
  .perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyDown(this.Keys.TAB);
        })
  .perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyUp(this.Keys.TAB);
        })
  .setValue("#password", "Password1!")
  .click("#kc-login")
  .waitForElementVisible("#nav_services")
  .click("#nav_services")
  .waitForElementVisible("#nav_Utility_feedback_link")
  .click("#nav_Utility_feedback_link")
  .pause(10000)
  .waitForElementVisible("#dform_widget_button_but_next_page_1")
  .pause(1000)
  .click("#dform_widget_button_but_next_page_1")
  .click("#dform_widget_helptext_txta_more_details")
  .click("#dform_widget_txta_more_details")
  .setValue("#dform_widget_txta_more_details", "test")
  .perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyDown(this.Keys.TAB);
        })
  .perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyUp(this.Keys.TAB);
        })
  .click("#dform_widget_button_but_FJH8BFY8")
  .waitForElementVisible("#dform_widget_txt_firstname")
  .assert.valueContains("#dform_widget_txt_firstname","henry")
  .assert.valueContains("#dform_widget_txt_lastname","jaya")
  .assert.valueContains("#dform_widget_eml_email","henry.jaya@verint.com")
  .assert.valueContains("#dform_widget_txt_contact_number","33333333333")
  .pause(1000)
  .click("#dform_widget_button_but_next_update_yd")
  .click("#dform_widget_button_but_submit_report")
  .assert.visible('#dform_page_complete')
  .pause(5000)
  .getText('#dform_widget_html_html_WSJ90UY3 p strong span', function(result){
	console.log("case id : "+result.value)
	})
  .assert.visible('#dform_widget_html_html_WSJ90UY3 p strong span')
  .end();
  });
});
