import fetch from "node-fetch";

async function testSubmit() {
  try {
    console.log("Attempting login...");
    const loginRes = await fetch("http://localhost:5001/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "123",
      }),
    });

    if (!loginRes.ok) {
      const errorText = await loginRes.text();
      throw new Error(`Login failed (${loginRes.status}): ${errorText}`);
    }

    const loginData: any = await loginRes.json();
    const token = loginData.meta?.accessToken || loginData.data?.accessToken;
    console.log("Logged in successfully. Token length:", token?.length);

    console.log("Submitting admission application...");
    const payload = {
      studentName: "Tanmay Kumar Dev",
      fatherName: "Father Kumar",
      motherName: "Mother Devi",
      dateOfBirth: "2015-08-20",
      gender: "Male",
      email: "tanmay.dev@example.com",
      phone: "9876543210",
      currentSchool: "Saint Mary School",
      currentGrade: "4",
      applyingForGrade: "5",
      address: "123 Test Avenue",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      parentEmail: "parent@example.com",
      parentPhone: "9876543210",
      admissionFeeAmount: 5000,
      documents: [
        {
          id: "doc_1",
          documentType: "Photo",
          fileName: "photo.jpg",
          fileUrl: "http://localhost:5173/uploads/photo.jpg",
          uploadedAt: new Date().toISOString(),
          verificationStatus: "Pending"
        }
      ]
    };

    const submitRes = await fetch("http://localhost:5001/api/v1/admissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const submitData: any = await submitRes.json();
    console.log("Submission Status:", submitRes.status);
    console.log("Response JSON:", JSON.stringify(submitData, null, 2));

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testSubmit();
