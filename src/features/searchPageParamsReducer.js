import { createSlice } from "@reduxjs/toolkit";
import Cookies from "universal-cookie";
import customization from "config/customization";

export const defaultSearchPageParamsState = {
    sort: customization.defaultSortDirection,
    from: 0,
    size: customization.defaultPageSize
}
const cookies = new Cookies();

export const searchPageParamsSlice = createSlice({
    name: "searchPageParams",
    initialState: defaultSearchPageParamsState,
    reducers: {
        updateSearchPageParams: (state, action) => {
            const searchPageParams = action.payload;
            cookies.set(customization.searchPageParamsCookie, searchPageParams, {path: '/', maxAge: '100000000'});
            return searchPageParams;
        }
    }
});

export const { updateSearchPageParams } = searchPageParamsSlice.actions;

export default searchPageParamsSlice.reducer;