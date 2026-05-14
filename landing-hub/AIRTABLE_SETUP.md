# Airtable Setup Guide — LandingHarbor

Create a new base in Airtable called **"LandingHarbor"** with the following tables:

---

## Table 1: Users
Used for login authentication.

| Field Name | Type |
|---|---|
| Email | Single line text (primary) |
| Name | Single line text |
| Password | Single line text |
| Role | Single select: `owner`, `admin` |
| Property | Single line text |
| Site Number | Single line text |

→ Create one record per user. Admin users get Role = `admin`.

---

## Table 2: Owner Profiles
| Field Name | Type |
|---|---|
| Email | Single line text (primary) |
| First Name | Single line text |
| Last Name | Single line text |
| Phone | Single line text |
| Property | Single line text |
| Site Number | Single line text |
| Mailing Address | Single line text |
| City | Single line text |
| State | Single line text |
| ZIP | Single line text |
| Emergency Contact Name | Single line text |
| Emergency Contact Phone | Single line text |
| Unit Make | Single line text |
| Unit Model | Single line text |
| Unit Year | Number |
| Serial / VIN | Single line text |
| Insurance Provider | Single line text |
| Insurance Doc Link | URL |
| Insurance Expiration | Date |
| Notes | Long text |
| Last Updated | Date |

---

## Table 3: Warranty Requests
| Field Name | Type |
|---|---|
| First Name | Single line text (primary) |
| Last Name | Single line text |
| Email | Single line text |
| Phone | Single line text |
| Property | Single line text |
| Site Number | Single line text |
| Serial / VIN | Single line text |
| Issue Description | Long text |
| Status | Single select: `Submitted`, `Under Review`, `Resolved`, `Denied` |
| Admin Notes | Long text |
| Submission Date | Date |
| Last Updated | Date |

---

## Table 4: Site Improvement Requests
| Field Name | Type |
|---|---|
| Last Name | Single line text (primary) |
| Email | Single line text |
| Phone | Single line text |
| Property | Single line text |
| Site Number | Single line text |
| Type of Improvement | Long text |
| Description of Work | Long text |
| Materials | Long text |
| Proposed Start Date | Date |
| Contractor Type | Single line text |
| Contractor Company | Single line text |
| Contractor Phone | Single line text |
| Contractor Email | Single line text |
| DIY Acknowledgement | Checkbox |
| Owner Signature | Single line text |
| Submission Date | Date |
| Status | Single select: `Pending Review`, `Under PM Review`, `Under President Review`, `Approved`, `Denied` |
| PM Review | Single select: `Pending`, `Approved`, `Denied` |
| President Review | Single select: `Pending`, `Approved`, `Denied` |
| Admin Notes | Long text |
| Last Updated | Date |

---

## Environment Variables (Netlify)

Set these in Netlify → Site settings → Environment variables:

| Key | Value |
|---|---|
| `AIRTABLE_TOKEN` | Your Airtable Personal Access Token |
| `AIRTABLE_BASE_ID` | Your base ID (starts with `app`) |

### Getting your Airtable token:
1. Go to airtable.com → Account → Developer hub → Personal access tokens
2. Create token with scopes: `data.records:read`, `data.records:write`
3. Grant access to your LandingHarbor base

### Getting your Base ID:
1. Open your base in Airtable
2. Go to Help → API documentation
3. The base ID is shown at the top (starts with `app`)
