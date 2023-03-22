import { browser, by, element, ExpectedConditions } from "protractor";
browser.ignoreSynchronization = true;
describe("signin page", () => {
  let tagName = "app-signin";
  browser.get("/signin");
  var signInButton = element
    .all(by.tagName("ion-button"))
    .filter(function (elem, index) {
      return elem.getText().then((text) => {
        return text == "SIGN IN";
      });
    });
  var usernameInput = element(by.tagName(tagName)).element(by.name("username"));
  var passwordInput = element(by.tagName(tagName)).element(by.name("password"));
  //   beforeEach(() => {
  //     browser.get("/signin");
  //   });
  it("should have image in title", () => {
    element(by.tagName(tagName))
      .element(by.deepCss("ion-title"))
      .element(by.tagName("img"))
      .getAttribute("src")
      .then((src) => {
        expect(src).toContain("assets/images/VA-logo-horizontal.png");
      });
  });
  it("should have a username and password field", () => {
    expect(passwordInput.isPresent()).toBeTruthy();
    expect(usernameInput.isPresent()).toBeTruthy();
  });
  it("should have a signin button", () => {
    expect(signInButton.count()).toBe(1);
  });
  it("should have a tech support button", () => {
    var techsupportButton = element(by.tagName(tagName)).element(
      by.css(".techsupportbutton")
    );
    expect(techsupportButton.isPresent()).toBeTruthy();
  });
  it("shouldn't log you in if you input garbage", async () => {
      usernameInput.sendKeys('asdfasdf');
      passwordInput.sendKeys('123123123');
      signInButton.click();
      var toastMessage = element(by.css('.toast-message'));
      await browser.wait(ExpectedConditions.visibilityOf(toastMessage), 10000, toastMessage.locator());
  });
});
 