curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "whats the Tubi Q2F costs in 000s group By Network and Outsourced support Total for Q2F grouped by Vendor",
    "namespace": "default",
    "userId": "user-123",
    "orgId": "org-456",
    "topK": 1
  }'


curl -X POST http://localhost:3000/api/embed/image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://testing-visonrag-bucket.s3.us-east-1.amazonaws.com/testing/page_10.png?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIDCnIBIdYNbWzZ%2BfUAmJpEDwV2NB2jiMqcOJsCnH7Dq8AiEAyASkmJRJRr%2BkstcOVix%2Blfl87MaRdxnlW2%2Fy9uZvCgoqlgQIif%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwzMDEyMTc2NDE2NzciDLeTdGrkr78B1%2BQMCSrqA4TwtAurDQH6F%2FlLS3VA9Oi0HdKn4Oyzo85wPPHPsK%2FTLZ25N3SYrt9J9KdwQE9iDL9VXZVOmNV2VBSnEYCOkXNKLHmX3h%2F3e52uRKLu2x6mEezrOa4du2gfpwHJtPi232xY%2ByYQBXcDvsSlYdMBX46lU%2BgmMx5kITakuBiFLBvZC%2FL%2BOcsFu6ErNMw3Q%2FrTeQFr22my7AO8%2Fs6KEpMGh8NnYPODopTIrYT%2F5I9ISXSZv8JGi%2BNOEKFFHOaYR%2F6UwJw8GTmQoMgZ1BfoMgnKTK4sXCDs1dJWxuYNmBVVxMA2BAodMCWVz1OyzYUY0t4dnTFt2MuaNrHgWMaRCzpNvx09F0ze8IYOk%2FX7pJ738caFNDvQxZJjoRTzTcla%2F20eusXt83GuKyNFffqbl%2BQ3dq2KkxsgYOtpUfZcFvh7xctSVl%2Fn9eLob7soJpsiQzaDMVmiUao6ee%2FGf93KjDCtZUG1wMPhq%2FQ1HCe8XeaoP5VTqNyQtb2DFAneKJIUzyiW0CygrAClABemdII7cMHxBbY%2FkMREEW3ruW0nmSnQuByMGXReAl6RzA59rYjEmrVHmJgYYNZCGPhm6G%2Fx5xtKMJudDn%2B%2BMK5h5d2opd1qxXEe2PZdKTkm%2Bb13gR1WSVXeOja%2B8a89lUo0QhYwo5v9ygY6swKlGKxfZOv418ISL9bLH33ZT6%2BWLISEBjEnHEIlGS3aoetg40IHAZgJ4Eqq%2Bz9CdLA4RGI4DVBS9XvUbr1deUfCLyekS2haIp81HDVY%2BAtapG3UptSnpbnKWU%2B%2BsqStjOD6%2Fy4M9pIC3WhNLby5GoxSx7G%2B3JrPqmVXKTbE9Z09KnlFXdOLTog12lLMzI4KBPBEzj6LEpVddsAPUo9NDG0QnUsDA9CkOTRV1eKJ3jfeJpMbmPQdZxxe91AhfwnZqdiZgnIeoB2lZpVHqzPWLQxrohYl7QlC9XkYaNyfRd8SEno3Qcf6ePQBAJDh3Ul3b%2B%2BGpaFrVcdc7R5EqX2a1CvceuPMexXXFvo9FJVSWM9jbpppv8mv%2B90cshPWn15r13P%2BIACLtdDze7yFvIcdkKvifHWr&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAUMIPYOTG7R2FH4L3%2F20260108%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260108T075318Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=ab30d4997d3849ac76c8554ec325545719243f3d8bf636ab94aaada0d3d7821a",
    "namespace": "default",
    "userId": "user-123",
    "orgId": "org-456"
  }'
