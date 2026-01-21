import { NextRequest } from 'next/server';

// This API route handles individual task operations (GET, PUT, PATCH, DELETE)
// The route pattern is: /api/tasks/[id]
// This will be matched by the file structure: app/api/tasks/[id]/route.ts

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log(`Received authorization header for task ${id} GET:`, authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`No valid authorization header provided for task ${id} GET`);
      return new Response(JSON.stringify({ error: 'No valid authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log(`API URL not configured for task ${id} GET`);
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Forwarding GET request to:`, `${apiUrl}/api/tasks/${id}`);

    // Make the request to the backend API, forwarding the Authorization header
    const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`Backend response status for task ${id} GET:`, response.status);

    // Return the response from the backend
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error for task ${id} GET:`, error);
    return new Response(JSON.stringify({ error: 'Failed to fetch task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log(`Received authorization header for task ${id} PUT:`, authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`No valid authorization header provided for task ${id} PUT`);
      return new Response(JSON.stringify({ error: 'No valid authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    const body = await request.json();

    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log(`API URL not configured for task ${id} PUT`);
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Forwarding PUT request to:`, `${apiUrl}/api/tasks/${id}`);

    // Make the request to the backend API, forwarding the Authorization header and body
    const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log(`Backend response status for task ${id} PUT:`, response.status);

    // Return the response from the backend
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error for task ${id} PUT:`, error);
    return new Response(JSON.stringify({ error: 'Failed to update task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log(`Received authorization header for task ${id} PATCH:`, authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`No valid authorization header provided for task ${id} PATCH`);
      return new Response(JSON.stringify({ error: 'No valid authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    const body = await request.json();

    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log(`API URL not configured for task ${id} PATCH`);
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Forwarding PATCH request to:`, `${apiUrl}/api/tasks/${id}/complete`);

    // Make the request to the backend API for the completion endpoint
    const response = await fetch(`${apiUrl}/api/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log(`Backend response status for task ${id} PATCH:`, response.status);

    // Return the response from the backend
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error for task ${id} PATCH:`, error);
    return new Response(JSON.stringify({ error: 'Failed to update task completion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log(`Received authorization header for task ${id} DELETE:`, authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`No valid authorization header provided for task ${id} DELETE`);
      return new Response(JSON.stringify({ error: 'No valid authorization header provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log(`API URL not configured for task ${id} DELETE`);
      return new Response(JSON.stringify({ error: 'API URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Forwarding DELETE request to:`, `${apiUrl}/api/tasks/${id}`);

    // Make the request to the backend API
    const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader, // Forward the original Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`Backend response status for task ${id} DELETE:`, response.status);

    // Return the response from the backend
    return new Response(null, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error for task ${id} DELETE:`, error);
    return new Response(JSON.stringify({ error: 'Failed to delete task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}