# API Specification

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Survey.fatihoune.com API
  version: 1.0.0
  description: RESTful API for survey creation, distribution, and analytics

servers:
  - url: https://survey.fatihoune.com/api
    description: Production server
  - url: http://localhost:3000/api
    description: Local development server

components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: session
      description: HTTP-only session cookie set by better-auth

  schemas:
    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string

    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time

    Survey:
      type: object
      properties:
        id:
          type: string
        uniqueId:
          type: string
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [draft, published, archived]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Question:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [multiple_choice, text_input, rating_scale, checkbox, dropdown, yes_no]
        text:
          type: string
        options:
          type: object
        required:
          type: boolean
        order:
          type: number
        logic:
          type: object

paths:
  # Authentication Endpoints
  /auth/register:
    post:
      summary: Register new user with email/password
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                name:
                  type: string
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid input or email already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/login:
    post:
      summary: Login with email/password
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful, session cookie set
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/logout:
    post:
      summary: Logout and clear session
      tags: [Authentication]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Logout successful
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/callback/google:
    get:
      summary: Google OAuth callback handler
      tags: [Authentication]
      parameters:
        - name: code
          in: query
          required: true
          schema:
            type: string
      responses:
        '302':
          description: Redirect to dashboard after successful OAuth
        '400':
          description: OAuth error

  # Survey Endpoints
  /surveys:
    get:
      summary: List all surveys for authenticated user
      tags: [Surveys]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: List of surveys
          content:
            application/json:
              schema:
                type: object
                properties:
                  surveys:
                    type: array
                    items:
                      $ref: '#/components/schemas/Survey'

    post:
      summary: Create a new survey
      tags: [Surveys]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title:
                  type: string
                description:
                  type: string
      responses:
        '201':
          description: Survey created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Survey'

  /surveys/{surveyId}:
    get:
      summary: Get survey details
      tags: [Surveys]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Survey details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Survey'
        '404':
          description: Survey not found

    patch:
      summary: Update survey metadata
      tags: [Surveys]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                status:
                  type: string
                  enum: [draft, published, archived]
      responses:
        '200':
          description: Survey updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Survey'

    delete:
      summary: Delete survey
      tags: [Surveys]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Survey deleted
        '404':
          description: Survey not found

  /surveys/{surveyId}/questions:
    post:
      summary: Add question to survey
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Question'
      responses:
        '201':
          description: Question created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Question'

  /surveys/{surveyId}/questions/{questionId}:
    patch:
      summary: Update question
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Question'
      responses:
        '200':
          description: Question updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Question'

    delete:
      summary: Delete question
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Question deleted

  /surveys/{surveyId}/questions/reorder:
    patch:
      summary: Reorder questions in survey
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                questionIds:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Questions reordered

  /surveys/{surveyId}/responses:
    post:
      summary: Submit survey response (public endpoint)
      tags: [Responses]
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                answers:
                  type: array
                  items:
                    type: object
                    properties:
                      questionId:
                        type: string
                      answer:
                        oneOf:
                          - type: string
                          - type: number
                          - type: array
                            items:
                              type: string
      responses:
        '201':
          description: Response submitted
        '400':
          description: Validation error (missing required questions)

    get:
      summary: Get all responses for survey (authenticated)
      tags: [Responses]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of responses
          content:
            application/json:
              schema:
                type: object
                properties:
                  responses:
                    type: array
                    items:
                      type: object

  /surveys/{surveyId}/analytics:
    get:
      summary: Get aggregated analytics for survey
      tags: [Analytics]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalResponses:
                    type: number
                  questionAnalytics:
                    type: array
                    items:
                      type: object

  /surveys/{surveyId}/export:
    get:
      summary: Export responses to CSV
      tags: [Export]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: CSV file
          content:
            text/csv:
              schema:
                type: string

  # User Endpoints
  /user/profile:
    get:
      summary: Get current user profile
      tags: [User]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

    patch:
      summary: Update user profile
      tags: [User]
      security:
        - sessionAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                password:
                  type: string
                currentPassword:
                  type: string
      responses:
        '200':
          description: Profile updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /dashboard/stats:
    get:
      summary: Get dashboard overview statistics
      tags: [Dashboard]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Dashboard statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalSurveys:
                    type: number
                  totalResponses:
                    type: number
                  surveysPublished:
                    type: number
```

---
