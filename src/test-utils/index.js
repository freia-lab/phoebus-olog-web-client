import { server } from "mocks/server";
import { rest } from "msw";
import { render } from "@testing-library/react";
import theme from "config/theme";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { setupStore } from "../stores";

function renderWithProviders(
    ui, 
    {
        preloadedState = {},
        store = setupStore(preloadedState),
        ...renderOptions
    } = {}
) {
    function Wrapper({children}){
        return  <Provider store={store}>
                    <ThemeProvider theme={theme}>
                        {children}
                    </ThemeProvider>
                </Provider>
    }
    return {store, ...render(ui, {wrapper: Wrapper, ...renderOptions})};
}

export * from '@testing-library/react';

export {renderWithProviders as render};

// Utility test function that will setup the server to respond to the request
// with a log entry having the desired `title` is the `requestPredicate` is true
// otherwise will respond with empty search results
export const testEntry = (title, id) => (
    {
        hitCount: 1,
        logs: [
            {
                "id": id ? id : 45,
                "owner": "jones",
                "source": title + " description",
                "description": title + " description",
                "title": title,
                "level": "Normal",
                "state": "Active",
                "createdDate": 1656599929021,
                "modifyDate": null,
                "events": null,
                "logbooks": [],
                "tags": [],
                "properties": [],
                "attachments": []
            }
        ]
    }
)

export const givenServerRespondsWithSearchRequest = ({title, requestPredicate, delay=100}) => {
    server.use(
        rest.get('*/logs/search', (req, res, ctx) => {
            if(requestPredicate(req)) {
                return res(
                    ctx.delay(delay),
                    ctx.json(testEntry(title))
                );
            } else {
                return res(
                    ctx.json({
                        hitCount: 0,
                        logs: []
                    })
                );
            }
        })
    )
}