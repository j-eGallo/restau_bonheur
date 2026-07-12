describe("Inscription restaurateur", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-cy='go-register']").click();
  });

  it("permet de créer un compte restaurateur", () => {
    const TEST_EMAIL = `restaurateur.cypress.${Date.now()}@test.com`;
    const TEST_PASSWORD = "password123";

    cy.get("[data-cy='register-nom']").type("Dupont");
    cy.get("[data-cy='register-prenom']").type("Jean");
    cy.get("[data-cy='register-email']").type(TEST_EMAIL);
    cy.get("[data-cy='register-password']").type(TEST_PASSWORD);

    cy.get("[data-cy='register-next']").click();

    cy.get("[data-cy='restaurant-nom']").type("Restaurant Test Cypress");

    cy.get("[data-cy='restaurant-logo']").selectFile(
      "cypress/img/logo-test.png",
      { force: true }
    );

    cy.get("[data-cy='restaurant-telephone']").type("0601020304");
    cy.get("[data-cy='restaurant-personnes-max']").clear().type("40");

    cy.get("[data-cy='register-next']").click();

    cy.contains("Française").click();

    cy.get("[data-cy='register-next']").click();
    cy.get("[data-cy='register-next']").click();
    cy.get("[data-cy='register-next']").click();

    cy.get("input[name='nmRue']").type("12");
    cy.get("input[name='rue']").type("Rue de la République");
    cy.get("input[name='codePostal']").type("13001");
    cy.get("input[name='ville']").type("Marseille");

    cy.get("[data-cy='register-submit']").click();

cy.get("[data-cy='auth-message']", { timeout: 10000 })
  .should("be.visible")
  .invoke("text")
  .then((text) => {
    cy.log("MESSAGE AFFICHÉ : " + text);
  });
  });

  it("bloque le passage à l'étape suivante si les champs obligatoires sont vides", () => {
    cy.get("[data-cy='register-next']").click();

    cy.get("[data-cy='auth-message']").should(
      "contain",
      "Veuillez remplir tous les champs"
    );
  });
});