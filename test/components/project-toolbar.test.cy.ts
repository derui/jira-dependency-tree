import { ProjectToolbar } from "@/components/project-toolbar";
import { Suggestion, suggestionFactory } from "@/model/suggestion";
import { withState } from "@cycle/state";
import xs from "xstream";

describe("components/ProjectToolbar", () => {
  it("initial display", () => {
    cy.mount(withState(ProjectToolbar, "state"), {
      props: () => xs.of<Suggestion>(suggestionFactory({})).remember(),
      testid: () => "",
    });

    cy.get("[data-testid=root]").should("exist");
    cy.get("[data-testid=condition-editor]").should("not.have.class", "--opened");
  });

  it("open/close search condition editor", () => {
    cy.mount(withState(ProjectToolbar, "state"), {
      props: () => xs.of<Suggestion>(suggestionFactory({})).remember(),
      testid: () => "",
    });

    cy.get("[data-testid=condition-editor]").click();
    cy.get("[data-testid=condition-editor]").should("have.class", "--opened");
    cy.contains("Cancel").click();
    cy.get("[data-testid=condition-editor]").should("not.have.class", "--opened");
  });
});
