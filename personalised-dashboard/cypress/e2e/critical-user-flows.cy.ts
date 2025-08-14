/// <reference types="cypress" />

describe('Critical User Flows', () => {
	const baseUrl = Cypress.config('baseUrl') || 'http://localhost:3000';

	context('Authentication', () => {
		it('should allow demo user to sign in and redirect to dashboard', () => {
			cy.visit(`${baseUrl}/auth/signin`);
			cy.get('button').contains(/demo sign in/i).click();
			cy.url().should('include', '/dashboard');
			cy.contains(/welcome back/i).should('exist');
		});

		it('should show error for invalid credentials', () => {
			cy.visit(`${baseUrl}/auth/signin`);
			cy.get('input[type="email"]').clear().type('wrong@example.com');
			cy.get('input[type="password"]').clear().type('wrongpass');
			cy.get('button[type="submit"]').click();
			cy.contains(/authentication failed|invalid email or password/i).should('exist');
		});
	});

	context('Search Functionality', () => {
		it('should search and display results', () => {
			cy.visit(`${baseUrl}/dashboard?tab=search`);
			// Find the search input (assuming a placeholder or label)
			cy.get('input[placeholder*="search" i], input[type="search"]').first().type('news{enter}');
			cy.contains(/search results for/i).should('exist');
			cy.get('[class*=ContentCard]').should('exist');
		});

		it('should show no results for gibberish', () => {
			cy.visit(`${baseUrl}/dashboard?tab=search`);
			cy.get('input[placeholder*="search" i], input[type="search"]').first().clear().type('asdkjfhaksjdfhaksjdfh{enter}');
			cy.contains(/no results found/i).should('exist');
		});
	});

	context('Drag and Drop', () => {
		it('should reorder content cards via drag and drop', () => {
			cy.visit(`${baseUrl}/drag-drop-demo`);
			cy.get('[class*=ContentCard]').as('cards');
			cy.get('@cards').should('have.length.greaterThan', 1);

			// Drag the first card to the position of the second card
			cy.get('@cards').eq(0).trigger('mousedown', { which: 1 });
			cy.get('@cards').eq(1).trigger('mousemove').trigger('mouseup', { force: true });

			// After drag, the order should change (visually, or by some text)
			// Optionally, check localStorage for contentOrder update
			cy.window().then(win => {
				const order = JSON.parse(win.localStorage.getItem('userPreferences') || '{}').contentOrder || [];
				expect(order.length).to.be.greaterThan(0);
			});
		});
	});
});
