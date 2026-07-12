const TEST_EMAIL = "gallojean.emmanuel@gmail.com";
const TEST_PASSWORD = "aaa";

describe("Connexion restaurateur", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("connecte le restaurateur créé par le test d'inscription", () => {
    cy.get("[data-cy='login-email']").type(TEST_EMAIL);
    cy.get("[data-cy='login-password']").type(TEST_PASSWORD);

    cy.get("[data-cy='login-submit']").click();

    cy.url().should("include", "/components/home");

    cy.window().then((window) => {
      const token = window.localStorage.getItem("restaurateur_token");
      expect(token).to.not.be.null;
    });
  });

  it("affiche une erreur avec des identifiants invalides", () => {
    cy.get("[data-cy='login-email']").type(TEST_EMAIL);
    cy.get("[data-cy='login-password']").type("mauvaismotdepasse");

    cy.get("[data-cy='login-submit']").click();

    cy.get("[data-cy='auth-message']").should("exist");
  });
});