const domain = 'https://us-central1-sportsgravy-testing.cloudfunctions.net/';
const nodeDomain = 'http://94.237.64.84:8000/'
export const apiURL = {

    //SIGN_UP_USER:domain+'signUpUser',
    SIGN_UP_USER:'https://sportsgravy-testing.appspot.com/register/signup',

    // GET_USER_DETAILS_FROM_URL:domain + 'getUserDetails',

    GET_USER_DETAILS_FROM_URL:'https://sportsgravy-testing.appspot.com/register/getUserDetails',

    GET_USER_GY_UID:domain+'getuserByUid',
    GET_ALL_SPORTS_BY_ORG: domain + 'getSportsByOrganization',

    GET_ORGANIZATION_LIST:domain+'getOrganizationList',

    CREATE_ORGANIZATION:domain+'createOrganization',
    GET_ORGANIZATION_BY_UID:domain+'getOrganizationById',
    UPDATE_ORGANIZATION:domain+'updateOrganization',
    GET_ORGANIZATION_FOR_GRID:domain +'getOrganizations',

    VALIDATE_USER_EMAIL:domain+'validateUserEmail',
    CREATE_USER:domain+'createUsers',
    GET_USER_LAYOUT_BY_UID:domain+'getuserByUid',
    GET_PLAYER_UID:domain+'getPlayersByUid',
    GET_GUARDIAN_BY_UID:domain+'getGuardiansByUid',
    UPDATE_USER:domain+'updateUsers',
    GET_USERS_FOR_GRID :domain+'getUsers',
// User Import
CREATE_USER_IMPORT:domain+'uploadUserRegistrationData',
GET_USERIMPORT_LIST:domain+'getImportLogList',
GET_USERIMPORT_SUCCESS_RECORD:domain+'getImportLogDataList',
GET_USERIMPORT_ERROR_RECORD:domain+'getImportLogDataDetails',
UPDATE_ERROR_RECORD:domain+'updateIntelimObj',

//Update Profile avatar

UPDATE_AVATAR:domain+'saveAvatar',


//Tag
GET_TEMPLATE:domain+'getTemplate',
CREATE_TAG:domain+'createTagTemplate',
DELETE_TAG:domain+'deleteTemplate',

//Level
GET_LEVEL:domain+'getLevels',
CREATE_LEVEL:domain+'createLevel',

//Canned Response
 CREATE_CANNED_RESPONSE:domain+'createCannedResponseTemplate',
 UPDATE_CANNED_RESPONSE:domain+'updateCannedResponseTemp',

//Team
    GET_SPORTS_BY_ORGANIZATION:domain+'getSportsByOrganization',
    GET_MEMBERS_BY_ORGANIZATION:domain+'getMembersByOrganization',
    GET_SEASON_BY_ORGANIZATION:domain+'getSeasonByOrganization',
    GET_POSITION_BY_ORGANIZATION:domain+'getPositionByOrganization',
    GET_LEVEL_BY_ORGANIZATION:domain+'getLevelsByOrganization',
    CREATE_TEAM:domain+'createTeam',
    GET_TEAMS_FOR_GRID:domain+'getTeamList',
    GET_TEAM_BY_UID:domain+'getTeamByUID',
    UPDATE_TEAM:domain+'updateTeam',

    //Setup
        //sports
        CREATE_SPORT:nodeDomain+'CreateSport',
        GET_SPORTS_BY_ID:domain+'getSportById',
        UPDATE_SPORT:domain+'updateSports',
        GET_SPORTS_FOR_GRID:nodeDomain+'getallSports',

        //skill
        CREATE_SKILL:domain+'createSkills',
        GET_SKILL_BY_ID:domain+'getSkillsById',
        UPDATE_SKILL:domain+'updateSkills',
        GET_SKILL_FOR_GRID:domain+'getSkills',

        //skillCategory
        CREATE_SKILLCATEGORY:domain+'createSkillCategory',
        GET_SKILLCAT_BY_ID:domain+'getSkillCategoryById',
        UPDATE_SKILLCAT:domain+'updateSkillCategory',
        GET_SKILLCAT_FOR_GRID :domain+'getSkillCategory',

        //PositionSkill
        GET_SKILL_AND_SKILLCAT_LIST:domain+'getSportsSkillsMappedList',
        GET_POSITION_LIST:domain+'getPositionsList',
        CREATE_POSITION_SKILL:domain+'createPositionSkills',
        GET_POSITIONSKILL_BY_ID:domain+'getPositionSkillById',
        UPDATE_POSITIONSKILL:domain+'updatePositionSkills',
        GET_POSITIONSKILL_FOR_GRID:domain+'getPositionSkills',

        //Position
        CREATE_POSITION:domain+'createPosition',
        GET_POSITION_BY_ID:domain+'getPositionById',
        UPDATE_POSITION:domain+'updatePosition',
        GET_POSITION_FOR_GRID:domain+'getPosition',

    //Season
    CREATE_SEASON:domain+'createSeason',
    GET_SEASON_BY_ID:domain+'getSeasonById',
    UPDATE_SEASON:domain+'updateSeason',
    GET_SEASON_FOR_GRID:domain+'getFilterSeason',
    GET_STATE_LIST:domain+'getStatesList',
    GET_COUNTRY_LIST:domain+'getCountryList',
    GET_ALL_SPORTS:domain +'getSports',
    GET_ALL_SKILLCATEGORY_LIST:domain+'getSkillCategoryList',
    GET_NATIONALGOV_LIST:domain+'getNationalGovermentList',
    GET_STATEGOV_LIST:domain+'getStateGovermentList',
    GET_ROLELIST:domain+'getRolesList'

}
export const Constant={
    unhandleError:'Unhandled Error.',
    sortingKey:'created_datetime',
    sortingValue:'desc',
    searchFilterKey:'keywords',
    seasonName:'Active Seasons',
    seasonType:'Active',
    allowed_file_format:["csv","xlsx","xls"],
    userAllowed:["coach","evaluator","manager"],
    file_size:5,
    organization_id:"1",
    admin:"admin",
    sysAdmin:"sys-admin",
    role:["admin","sys-admin"],
    email_validation:/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    unhandleError_update_userImport:"Due to Network Error it's been in error record.By clicking on process you can proceed further.",
    websiteValidation:/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
    gridLoadingMsg:"Loading",
    msgForCreating:"Creating",
    msgForUpdating:"Updating"
}