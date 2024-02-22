/**
 * Copyright (C) 2019 European Spallation Source ERIC.
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * <p>
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

let customization = {
    /**
     * The name of the "level" (legacy name) meta data field.
     */
    level: "Entry Type",
    /**
     * Values for the "level" drop-down.
     */
    levelValues: [
        "Normal",
	"FATAL",
	"ERROR",
	"WARN",
	"INFO",
	"IDEA",
	"DOCU",
	"MEASURE",
	"TODO",
	"DONE",
	"FIXED",
	"WOW"    
    ],

    /**
     * Default "level" for new log entries
     */
    defaultLevel: "Normal",
    
    /**
     * Specifies whether to support grouping of log entries.
     */
    log_entry_groups_support: true,

    /**
     * Specifies whether to support editing of log entries.
     */
    log_edit_support: true,

    /**
     * Default search params
     */
    defaultSearchParams: {start: "24 hours", end: "now"},
    defaultSortDirection: "down",

    /**
     * Default page size in search
     */
    defaultRowsPerPageOptions: [10, 30, 50],
    defaultPageSize: 30,

    /**
     * Default frequency of background search, in milliseconds
     */
    defaultSearchFrequency: 30000,

    /**
     * Name of the cookie that stores the current search string
     */
    searchParamsCookie: 'searchParams',

    /**
     * Name of the cookie that stores the current search string
     */
    searchPageParamsCookie: 'searchPageParams',

    /**
     * Max total attachment upload size and individual file size (MB)
     */
    defaultMaxRequestSizeMb: 100,
    defaultMaxFileSizeMb: 50,

    /**
     * Base URL pointing to the Olog service. Required in order to support imbedded into the description (body) of a log entry.
     */
    APP_BASE_URL: process.env.REACT_APP_BASE_URL, // e.g. http://localhost:8080/Olog

    /**
     * Enable/Disable the beta feature
     */
    ENABLE_BETA: process.env.REACT_APP_ENABLE_BETA === "true"
}

export default customization;
