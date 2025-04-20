migrate-create:
	@echo "---Creating migration files---"
	# another - migrate create -ext sql -dir $(MPATH) -seq -digits 5 $(NAME)
	go run cmd/migrate/main.go create $(NAME) sql

migrate-up:
	go run cmd/migrate/main.go up

migrate-down:
	go run cmd/migrate/main.go down

migrate-force:
	go run cmd/migrate/main.go force $(VERSION)

build:
	go build cmd/api/main.go

run:
	go run cmd/api/main.go

test:
	go test -v ./module/*/*/ -coverprofile account.out \
        && go tool cover -html=account.out -o account.html

mock:
	mockery --dir=module/thirdparty/users/repo --name=IUserRepo --output=module/thirdparty/users/mocks
	mockery --dir=module/thirdparty/users/service --name=IUserService --output=module/thirdparty/users/mocks
	mockery --dir=module/thirdparty/users/repo --name=IUserPermissionRepo --output=module/thirdparty/users/mocks
	mockery --dir=module/admin/facility/repo  --name IFacilityRepo --output=module/admin/facility/mocks
	mockery --dir=module/admin/facility/service  --name IFacilityService --output=module/admin/facility/mocks
	mockery --dir=module/thirdparty/tags/repo  --name ITagsRepo --output=module/thirdparty/tags/mocks
	mockery --dir=module/thirdparty/tags/service  --name ITagsService --output=module/thirdparty/tags/mocks
	mockery --dir=module/thirdparty/permissions/repo  --name IPermissionsRepo --output=module/thirdparty/permissions/mocks
	mockery --dir=module/thirdparty/permissions/service  --name IPermissionsService --output=module/thirdparty/permissions/mocks
	mockery --dir=module/admin/jsonschema/service  --name IJsonSchemaService --output=module/admin/jsonschema/mocks
	mockery --dir=module/admin/facility/repo  --name IFacilityTypeRepo --output=module/admin/facility/mocks
	mockery --dir=module/admin/facility/repo  --name IFacilityPocRepo --output=module/admin/facility/mocks
	mockery --dir=module/thirdparty/tag_permissions/repo  --name ITagPermissionsRepo --output=module/thirdparty/tag_permissions/mocks
	mockery --dir=module/thirdparty/tag_permissions/service  --name ITagPermissionsService --output=module/thirdparty/tag_permissions/mocks
	mockery --dir=module/thirdparty/api_permissions/repo  --name IApiPermissionsRepo --output=module/thirdparty/api_permissions/mocks
	mockery --dir=module/thirdparty/api_permissions/service  --name IApiPermissionsService --output=module/thirdparty/api_permissions/mocks
	mockery --dir=module/admin/api/repo  --name IApiRepo --output=module/admin/api/mocks
	mockery --dir=module/admin/api/service  --name IApiService --output=module/admin/api/mocks
	mockery --dir=module/admin/registry/supplement/repo  --name ISupplementRepo --output=module/admin/registry/supplement/mocks
	mockery --dir=module/admin/registry/supplement/service  --name ISupplementService --output=module/admin/registry/supplement/mocks
	mockery --dir=util/password --name=IPasswordUtil  --output=util/password/mocks
	mockery --dir=module/admin/es_log/service --name=IEsLogService  --output=module/admin/es_log/mocks
	mockery --dir=module/admin/es_log/repo --name=IEsLogRepo --output=module/admin/es_log/mocks
	mockery --dir=module/thirdparty/users/repo --name=IUserCompliancePermissionRepo --output=module/thirdparty/users/mocks
