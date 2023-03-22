import { browser, by, element, ElementFinder } from 'protractor';
browser.ignoreSynchronization = true;
export class AppPage {
  navigateTo(destination) {
    return browser.get(destination);
  }

  getTitle() {
    return browser.getTitle();
  }

  getPageOneTitleText() {
    return element(by.tagName('app-home')).element(by.deepCss('ion-title')).getText();
  }

  
}
