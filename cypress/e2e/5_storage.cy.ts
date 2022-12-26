describe("load issues", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("restore from local storage", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "jiraDependencyTree",
          JSON.stringify({
            settings: {
              issueNodeSize: { height: 10, width: 100 },
              userDomain: "domain",
              credentials: {
                email: "email",
                jiraToken: "token",
              },
            },
          }),
        );
      },
    });

    // check restored value
    cy.testid("user-configuration/marker").should("not.have.class", "--show");
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/user-domain/input").should("have.value", "domain");
    cy.testid("user-configuration/email/input").should("have.value", "email");
    cy.testid("user-configuration/jira-token/input").should("have.value", "token");

    // re-open and keep previous value
    cy.testid("user-configuration/submit/button").click();
    cy.testid("user-configuration/opener").click();

    cy.testid("user-configuration/user-domain/input").should("have.value", "domain");
    cy.testid("user-configuration/email/input").should("have.value", "email");
    cy.testid("user-configuration/jira-token/input").should("have.value", "token");
  });

  it("store local storage submitted settings", () => {
    cy.visit("/");

    // type value and submit
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/user-domain/input").type("domain");
    cy.testid("user-configuration/email/input").type("email");
    cy.testid("user-configuration/jira-token/input").type("token");
    cy.testid("user-configuration/submit/button").click();

    // check in local storage
    cy.window().then((win) => {
      let item = win.localStorage.getItem("jiraDependencyTree") || "";
      item = JSON.parse(item);

      expect(item).to.deep.equal({
        settings: {
          issueNodeSize: { width: 160, height: 80 },
          userDomain: "domain",
          credentials: {
            email: "email",
            jiraToken: "token",
          },
          graphLayout: "Horizontal",
        },
      });
    });
  });
});
