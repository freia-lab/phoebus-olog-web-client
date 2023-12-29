import { resultList, testEntry } from "../mocks/fixtures/generators";
import customization from "config/customization";
import { defaultSearchPageParamsState } from "features/searchPageParamsReducer";
import { defaultSearchParamsState } from "features/searchParamsReducer";
import TestRouteProvider from "test-utils/TestRouteProvider";
import { v4 as uuidV4 } from "uuid";

describe("Smoketests", () => {

  it("renders without crashing", () => {
    cy.mount(<TestRouteProvider />);
  });

  it("renders an error banner if the logbook service cannot be reached", () => {
    
    // Given the logbook service doesn't respond
    cy.intercept(
      'GET',
      '**',
      {
        forceNetworkError: true
      }
    );

    // When rendered
    cy.mount(<TestRouteProvider />);

    // Then an error message is present
    // (unfortunately snackbar doesn't support aria labels etc atm)
    cy.findByText(/search error/i).should("exist");

  });

});

describe("Default Behaviors", () => {

  it('renders with a default search query', () => {
    
    // When rendered
    cy.mount(<TestRouteProvider initialEntries={["/"]} />);

    // There is a default search term
    cy.findByRole("searchbox", {name: /search logs/i}).should("have.value", "start=12 hours&end=now");

  });

  it("uses previous cookie state for search params if they exist", () => {

    // Given we set the search params to something that isn't the default value
    expect(defaultSearchPageParamsState.sort).not.equal("up");
    expect(defaultSearchPageParamsState.size).not.equal(50);
    cy.setCookie(customization.searchPageParamsCookie, JSON.stringify(
      {
        ...defaultSearchPageParamsState,
        sort: "up",
        size: 50
      }
    ));
    const title = "my unique title";
    cy.setCookie(customization.searchParamsCookie, JSON.stringify(
      {
        ...defaultSearchParamsState,
        title
      }
    ));
    
    // Then when the user loads the page
    cy.mount(<TestRouteProvider />);

    // The search bar shows their existing search
    cy.findByRole("searchbox", {name: /search logs/i}).invoke("val").should("include", title);

    // page size should be set to cookie value
    cy.findByRole("button", {name: /hits per page 50/i}).should("exist");

    // and sort should be set to cookie value
    cy.findByRole('button', {name: /show advanced search/i}).click();
    cy.findByRole('radio', {name: /ascending/i}).should("be.checked");

  })

})

describe("Search Interface", () => {

  it("supports searching with the search box", () => {
  
    // When rendered
    cy.mount(<TestRouteProvider />);
  
    // Given search will return results
    const entry = testEntry({title: uuidV4()});
    const start = uuidV4();
    cy.intercept(
      'GET',
      '**/logs/search*',
      (req) => {
        req.reply(
          {
            statusCode: 200,
            body: req.query.start === start ? resultList([
              entry
            ]) : resultList([])
          }
        ) 
      }
    );
  
    // When searched
    cy.findByRole("searchbox", {name: /search logs/i}).clear().type(`start=${start}{Enter}`);
  
    // then the results are updated
    cy.findByText(entry.title).should("exist");
  
  });
  
  it("supports search by toggling advanced search", () => {

    cy.mount(<TestRouteProvider />);

    // given the search returns results
    const entry = testEntry({title: uuidV4()});
    cy.intercept(
      'GET',
      '**/logs/search*',
      (req) => {
        req.reply(
          {
            statusCode: 200,
            body: req.query.title === entry.title ? resultList([
              entry
            ]) : resultList([])
          }
        ) 
      }
    );

    // When the advanced search is opened,
    // title entered
    // And then toggled closed
    cy.findByRole('button', {name: /show advanced search/i}).click();
    cy.findByRole('heading', {name: /advanced search/i}).should("exist");
    cy.findByRole('textbox', {name: /title/i}).type(entry.title)
    cy.findByRole('button', {name: /hide advanced search/i}).click();

    // then the results include the expected query
    cy.findByText(entry.title).should("exist");
    
  });

  it("searches tags instantly from advanced search", () => {

    cy.mount(<TestRouteProvider />);

    // Given tags exist
    cy.intercept(
      'GET',
      '**/tags',
      {
        statusCode: 200,
        body: [
            {
                "name": "bar",
                "state": "Active"
            },
            {
                "name": "baz",
                "state": "Active"
            },
            {
                "name": "foo",
                "state": "Active"
            }
        ]
      }
    );

    // given the search returns results
    const entry = testEntry({title: uuidV4(), });
    cy.intercept(
      'GET',
      '**/logs/search*',
      (req) => {
        req.reply(
          {
            statusCode: 200,
            body: req.query.tags === "foo" ? resultList([
              entry
            ]) : resultList([])
          }
        ) 
      }
    );

    // When the advanced search is opened,
    // and tags entered
    cy.findByRole('button', {name: /show advanced search/i}).click();
    cy.findByRole('heading', {name: /advanced search/i}).should("exist");
    cy.findByLabelText(/tags/i).type('foo{downArrow}{enter}');

    // then the results include the expected query
    cy.findByText(entry.title).should("exist");
    
  });

  it("searches logbooks instantly from advanced search", () => {

    cy.mount(<TestRouteProvider />);

    // Given logbooks exist
    cy.intercept(
      'GET',
      '**/logbooks',
      {
        statusCode: 200,
        body: [
          {
              "name": "test controls",
              "owner": null,
              "state": "Active"
          },
          {
              "name": "test operations",
              "owner": "olog-logs",
              "state": "Active"
          }
        ]
      }
    );

    // given the search returns results
    const entry = testEntry({title: uuidV4(), });
    cy.intercept(
      'GET',
      '**/logs/search*',
      (req) => {
        req.reply(
          {
            statusCode: 200,
            body: req.query.logbooks === "test controls" ? resultList([
              entry
            ]) : resultList([])
          }
        ) 
      }
    );

    // When the advanced search is opened,
    // and tags entered
    cy.findByRole('button', {name: /show advanced search/i}).click();
    cy.findByRole('heading', {name: /advanced search/i}).should("exist");
    cy.findByLabelText(/logbooks/i).type('test controls{downArrow}{enter}');

    // then the results include the expected query
    cy.findByText(entry.title).should("exist");
    
  });

  it('executes the same query repeatedly (no caching)', () => {
    
    cy.mount(<TestRouteProvider />);

    // Given we expect search to be performed many times for the same query
    // But to return updated results each time
    const entry1 = testEntry({title: "entry 1 - " + uuidV4()});
    const entry2 = testEntry({title: "entry 2 - " + uuidV4()});
    const entry3 = testEntry({title: "entry 3 - " + uuidV4()});

    // Given the first search returns just entry 1
    cy.intercept(
        "GET",
        "**/logs/search*",
        {
            responseCode: 200,
            body: resultList([entry1])
        }
    )

    // When we search, then we expect just entry 1
    cy.findByRole('searchbox', {name: /Search/i}).click().type("{Enter}");
    cy.findByRole('heading', {name: entry1.title}).should("exist");
    cy.findByRole('heading', {name: entry2.title}).should("not.exist");
    cy.findByRole('heading', {name: entry3.title}).should("not.exist");

    // Given the search now returns entry 1 and 2
    cy.intercept(
        "GET",
        "**/logs/search*",
        {
            responseCode: 200,
            body: resultList([entry1, entry2])
        }
    )

    // When we search, then we expect just entry 1 and 2
    cy.findByRole('searchbox', {name: /Search/i}).click().type("{Enter}");
    cy.findByRole('heading', {name: entry1.title}).should("exist");
    cy.findByRole('heading', {name: entry2.title}).should("exist");
    cy.findByRole('heading', {name: entry3.title}).should("not.exist"); 
    
    // finally given search returns all entries
    cy.intercept(
        "GET",
        "**/logs/search*",
        {
            responseCode: 200,
            body: resultList([entry1, entry2, entry3])
        }
    )

    // When we search, then we expect all entries
    cy.findByRole('searchbox', {name: /Search/i}).click().type("{Enter}");
    cy.findByRole('heading', {name: entry1.title}).should("exist");
    cy.findByRole('heading', {name: entry2.title}).should("exist");
    cy.findByRole('heading', {name: entry3.title}).should("exist");

  })

});

describe('Navigating Results', () => {

  it('can navigate different log entries by clicking on the next/previous buttons on the log entry', () => {
    
    // Given the server responds with many search results to click on
    const entry1 = testEntry({title: 'Entry 1'});
    const entry2 = testEntry({title: 'Entry 2'});
    const entry3 = testEntry({title: 'Entry 3'});
    cy.intercept(
      'GET',
      '**/logs/search*',
      {
        statusCode: 200,
        body: resultList([
          entry1, entry2, entry3
        ])
      }
    );
    cy.intercept(
      'GET',
      `**/logs/${entry1.id}`,
      {
        statusCode: 200,
        body: entry1
      }
    );
    cy.intercept(
      'GET',
      `**/logs/${entry2.id}`,
      {
        statusCode: 200,
        body: entry2
      }
    );
    cy.intercept(
      'GET',
      `**/logs/${entry3.id}`,
      {
        statusCode: 200,
        body: entry3
      }
    );

    cy.mount(<TestRouteProvider />);

    // We can click the header from the result list to open its details
    cy.findByRole('grid', {name: /search results/i})
    .within(() => {
      cy.findByRole('heading', {name: 'Entry 1'}).click();
    });

    // Once clicked, the details page is opened (level 2 header)
    // And we can navigate to the next entry but not the previous one
    cy.findByRole('heading', {name: 'Entry 1', level: 3}).should("exist");
    cy.findByRole('button', {name: /previous log entry/i}).should("be.disabled");
    cy.findByRole('button', {name: /next log entry/i}).should("not.be.disabled").click();
    
    // Once viewing the second entry, we can navigate to the previous or next entry
    cy.findByRole('heading', {name: 'Entry 2', level: 3}).should("exist");
    cy.findByRole('button', {name: /previous log entry/i}).should("not.be.disabled");
    cy.findByRole('button', {name: /next log entry/i}).should("not.be.disabled").click();

    // Once viewing the last entry we can navigate to the previous but not last entry
    cy.findByRole('heading', {name: 'Entry 3', level: 3}).should("exist");
    cy.findByRole('button', {name: /previous log entry/i}).should("not.be.disabled");
    cy.findByRole('button', {name: /next log entry/i}).should("be.disabled");

  });

  it('search results sort order is newest-date-first by default, and updates as expected', () => {

      // Given the server will return search results out of order
      // (IMPORTANT: currently the ordering is server-side since there is paging)
      cy.intercept(
        'GET',
        '**/logs/search*',
        {
          statusCode: 200,
          body: resultList([
            testEntry({title: 'log entry 3', createdDate: Date.parse('2023-01-31T00:00:03')}),
            testEntry({title: 'log entry 1', createdDate: Date.parse('2023-01-31T00:00:01')}),
            testEntry({title: 'log entry 2', createdDate: Date.parse('2023-01-31T00:00:02')}),
          ])
        }
      );

      cy.mount(<TestRouteProvider />);
      
      // The user will see search results in descending order by default (newest date first)
      const descendingTitles = ['log entry 3', 'log entry 2', 'log entry 1'];
      cy.findByRole("grid", {name: /Search Results/i}).within(() => {
        cy.findAllByRole('heading', {name: /log entry \d/}).each( (item, index) => {
          cy.wrap(item)
            .should("contain.text", descendingTitles[index]);
        })
      });
  
      // Update the sort direction
      cy.findByRole('button', {name: /show advanced search/i}).click();
      cy.findByRole('radio', {name: /ascending/i}).click();
      // cy.findByRole('button', {name: /hide advanced search/i}).click();

      // The user will see the search results in ascending order
      const ascendingTitles = ['log entry 1', 'log entry 2', 'log entry 3'];
      cy.findByRole("grid", {name: /Search Results/i}).within(() => {
        cy.findAllByRole('heading', {name: /log entry \d/}).each( (item, index) => {
          cy.wrap(item)
            .should("contain.text", ascendingTitles[index]);
        })
      });
  
  })

  it("can view a log directly, even when not in search results list", () => {
    
    // Given nothing in search results 
    cy.intercept(
      'GET',
      '**/logs/search*',
      {
        statusCode: 200,
        body: resultList([])
      }
    );

    // But a log exists
    const log = testEntry({title: 'Some Log Entry'});
    cy.intercept(
      'GET',
      `**/logs/${log.id}`,
      {
        statusCode: 200,
        body: log
      }
    );

    // When navigating to a log directly
    cy.mount(<TestRouteProvider initialEntries={[`/logs/${log.id}`]} />)

    // Then we can view it
    cy.findByRole('heading', {name: testEntry.title, level: 2}).should("exist");

  })

  it("cannot view a log directly if it doesn't exist", () => {
    
    // Given a log doesn't exist
    cy.intercept(
      'GET',
      `**/logs/**`,
      {
        statusCode: 404
      }
    );

    // When navigating to a log directly
    cy.mount(<TestRouteProvider initialEntries={[`/logs/12345abcde12345`]} />)

    // Then we get an error
    cy.findByRole('heading', {name: /log record .* not found/i}).should("exist");

  })

});

describe('Login/Logout', () => {

  it("displays sign-in and disabled log entry when logged out", () => {
  
      // Given user is signed out
      cy.intercept(
        "GET",
        "**/user", 
        {
          statusCode: 404 // service returns a 404 instead of 401 or 403 when unauthorized/unauthenticated
        }
      )
  
      // When rendered
      cy.mount(<TestRouteProvider />)
  
      // Then the user sees a login button
      cy.findByRole('button', {name: /Sign In/i}).should("exist");
  
  });
  
  it("displays username and allows creating log entries when signed in", () => {
  
      // Given user is signed in
      const user = {
        userName: "garfieldHatesMondays",
        roles: ["ROLE_ADMIN"]
      };
      cy.intercept(
        "GET",
        "**/user",
        {
          responseCode: 200,
          body: user
        }
      )
  
      // When rendered
      cy.mount(<TestRouteProvider />);
  
      // Then the user is logged in 
      cy.findByRole('button', {name:/garfieldHatesMondays/i}).should("exist");
  
  });

  it('when navigating to create a log entry directly but not logged in, the user is prompted to login', () => {

      // Given user is signed out
      cy.intercept(
        "GET",
        "**/user", 
        {
          statusCode: 404 // service returns a 404 instead of 401 or 403 when unauthorized/unauthenticated
        }
      )
  
      // When trying to create a log directly
      cy.mount(<TestRouteProvider initialEntries={[`/logs/create`]} />);

      // then login is displayed
      cy.findByLabelText(/password/i).should("exist");
  
  });

})